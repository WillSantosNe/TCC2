import os
from datetime import datetime, date
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
from flask_migrate import Migrate
from extensions import db
from models import Usuario, Disciplina, Tarefa, Anotacao, StatusDisciplina, StatusTarefa, TipoTarefa
from flask_jwt_extended import JWTManager
from authlib.integrations.flask_client import OAuth 

load_dotenv()

def create_app():
    """
    Cria e configura uma instância da aplicação Flask.
    """
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    db.init_app(app)
    Migrate(app, db)
    oauth = OAuth(app)
    jwt = JWTManager(app) # Descomente se for usar JWT no futuro

    oauth.register(
        name='google',
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

    @app.cli.command("create-db")
    def create_db_command():
        """Cria as tabelas do banco de dados a partir dos modelos."""
        with app.app_context():
            db.create_all()
        print("Tabelas criadas com sucesso!")

    @app.cli.command("seed-admin")
    def seed_admin_command():
        """Cria um usuário administrador padrão."""
        with app.app_context():
            admin_user = Usuario.query.filter_by(email="admin@admin.com").first()
            if admin_user:
                print("Usuário admin já existe.")
                return
            new_admin = Usuario(nome="Admin", email="admin@admin.com")
            new_admin.set_senha("1234")
            db.session.add(new_admin)
            db.session.commit()
            print("Usuário admin criado com sucesso!")
    
    @app.route('/', methods=['GET', 'POST'])
    def rota_login():
        if request.method == 'POST':
            email = request.form.get('email')
            senha = request.form.get('senha')
            user = Usuario.query.filter_by(email=email).first()
            if user and user.check_senha(senha):
                session['user_id'] = user.id
                return redirect(url_for('rota_dashboard'))
            else:
                flash('Email ou senha inválidos. Tente novamente.', 'danger')
        return render_template('login.html')
    
    @app.route('/logout')
    def rota_logout():
        session.clear()
        return redirect(url_for('rota_login'))

    @app.route('/cadastro', methods=['GET', 'POST'])
    def rota_cadastro():
        if request.method == 'POST':
            nome = request.form.get('nome')
            email = request.form.get('email')
            senha = request.form.get('senha')

            if not nome or not email or not senha:
                flash('Todos os campos são obrigatórios!', 'danger')
                return redirect(url_for('rota_cadastro'))

            usuario_existente = Usuario.query.filter_by(email=email).first()
            if usuario_existente:
                flash('Este e-mail já está em uso. Por favor, escolha outro.', 'danger')
                return redirect(url_for('rota_cadastro'))

            novo_usuario = Usuario(nome=nome, email=email)
            novo_usuario.set_senha(senha)
            db.session.add(novo_usuario)
            db.session.commit()

            flash('Conta criada com sucesso! Por favor, faça o login.', 'success')
            return redirect(url_for('rota_login'))
        return render_template('cadastro.html')
    
    @app.route('/login/google')
    def login_google():
        redirect_uri = url_for('authorize_google', _external=True)
        return oauth.google.authorize_redirect(redirect_uri)

    @app.route('/login/google/callback')
    def authorize_google():
        try:
            token = oauth.google.authorize_access_token()
            user_info = token.get('userinfo')
            if not user_info:
                 user_info = oauth.google.parse_id_token(token)

        except Exception as e:
            flash(f"Ocorreu um erro durante a autenticação com o Google: {e}", "danger")
            return redirect(url_for('rota_login'))

        user = Usuario.query.filter_by(email=user_info['email']).first()

        if user is None:
            user = Usuario(
                email=user_info['email'],
                nome=user_info.get('given_name', user_info.get('name', 'Usuário')),
            )
            user.senha_hash = 'google_user_no_password' 
            db.session.add(user)
            db.session.commit()
            flash('Conta criada com sucesso através do Google!', 'success')
        
        session['user_id'] = user.id
        return redirect(url_for('rota_dashboard'))

    @app.route('/dashboard')
    def rota_dashboard():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            session.clear()
            return redirect(url_for('rota_login'))

        ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
        atividades = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).all()

        hoje = date.today()
        for atividade in atividades:
            if atividade.data_entrega < hoje and atividade.status != StatusTarefa.CONCLUIDA:
                atividade.status = StatusTarefa.ATRASADA
                
        prioridade_status = {
            StatusTarefa.ATRASADA: 0,
            StatusTarefa.ANDAMENTO: 1,
            StatusTarefa.A_FAZER: 2,
            StatusTarefa.CONCLUIDA: 3
        }
        atividades_ordenadas = sorted(
            atividades, 
            key=lambda x: (prioridade_status.get(x.status, 99), x.data_entrega)
        )
        
        tarefas_dashboard = [t for t in atividades_ordenadas if t.tipo.name == 'TAREFA'][:4]
        provas_dashboard = [p for p in atividades_ordenadas if p.tipo.name == 'PROVA'][:4]

        todas_tarefas_json = [{
            "id": t.id, "titulo": t.titulo,
            "disciplina": {"id": t.disciplina.id, "nome": t.disciplina.nome}
        } for t in atividades]

        disciplinas_json = [{"id": d.id, "nome": d.nome} for d in usuario.disciplinas]

        return render_template(
            'principal.html', 
            usuario=formatar_usuario_json(usuario), 
            disciplinas=disciplinas_json,
            tarefas_dashboard=tarefas_dashboard,
            provas_dashboard=provas_dashboard,
            # Envia as listas formatadas para o template
            todas_tarefas_json=todas_tarefas_json,
            disciplinas_json=disciplinas_json
        )
    
    @app.route('/disciplinas/criar', methods=['POST'])
    def criar_disciplina():
        if 'user_id' not in session:
            flash('Você precisa estar logado para criar uma disciplina.', 'warning')
            return redirect(url_for('rota_login'))

        nome = request.form.get('principalDisciplinaNome')
        professor = request.form.get('principalDisciplinaProfessor')
        periodo = request.form.get('principalDisciplinaPeriodo')
        status_str = request.form.get('principalDisciplinaStatus')

        status_map = {
            "Ativa": StatusDisciplina.ATIVA,
            "Em Andamento": StatusDisciplina.ANDAMENTO,
            "Concluída": StatusDisciplina.CONCLUIDA
        }
        status_enum = status_map.get(status_str, StatusDisciplina.ATIVA)

        nova_disciplina = Disciplina(
            nome=nome,
            professor=professor,
            periodo=periodo,
            status=status_enum,
            usuario_id=session['user_id']
        )

        db.session.add(nova_disciplina)
        db.session.commit()

        return redirect(request.referrer or url_for('rota_dashboard'))


    @app.route('/tarefas')
    def rota_tarefas():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            session.clear()
            return redirect(url_for('rota_login'))

        # --- LÓGICA DE BUSCA E ORDENAÇÃO (sem alterações) ---
        ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
        tarefas_do_usuario = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).order_by(Tarefa.data_entrega).all()

        # Filtro por disciplina se especificado
        disciplina_id_filtro = request.args.get('disciplina_id', type=int)
        if disciplina_id_filtro:
            # Verifica se a disciplina pertence ao usuário
            if disciplina_id_filtro in ids_disciplinas_usuario:
                tarefas_do_usuario = [t for t in tarefas_do_usuario if t.disciplina_id == disciplina_id_filtro]
            else:
                # Se a disciplina não pertence ao usuário, limpa o filtro
                disciplina_id_filtro = None

        hoje = date.today()
        for tarefa in tarefas_do_usuario:
            if tarefa.data_entrega < hoje and tarefa.status != StatusTarefa.CONCLUIDA:
                tarefa.status = StatusTarefa.ATRASADA

        prioridade_status = {
            StatusTarefa.ATRASADA: 0,
            StatusTarefa.ANDAMENTO: 1,
            StatusTarefa.A_FAZER: 2,
            StatusTarefa.CONCLUIDA: 3
        }
        tarefas_ordenadas = sorted(
            tarefas_do_usuario, 
            key=lambda x: (prioridade_status.get(x.status, 99), x.data_entrega)
        )

        # --- FORMATAÇÃO DOS DADOS PARA JSON ---

        # Formata a lista de TAREFAS para JSON
        tarefas_para_json = [{
            "id": t.id, "titulo": t.titulo, "descricao": t.descricao,
            "data_entrega": t.data_entrega.isoformat(),
            "status": t.status.name, "tipo": t.tipo.name,
            "disciplina": {"id": t.disciplina.id, "nome": t.disciplina.nome}
        } for t in tarefas_ordenadas]

        # Formata a lista de DISCIPLINAS para JSON (necessário para os filtros)
        disciplinas_para_json = [{"id": d.id, "nome": d.nome} for d in usuario.disciplinas]

        # --- FIM DA FORMATAÇÃO ---

        return render_template('tarefas.html', 
                            tarefas=tarefas_para_json, 
                            disciplinas=disciplinas_para_json, # Passa a lista formatada
                            usuario=formatar_usuario_json(usuario),
                            disciplina_filtro_id=disciplina_id_filtro) # Passa o ID da disciplina filtrada
    

    
    @app.route('/tarefas/criar', methods=['POST'])
    def criar_tarefa():
        if 'user_id' not in session:
            flash('Você precisa estar logado para criar uma tarefa.', 'warning')
            return redirect(url_for('rota_login'))

        # Pega os dados do formulário
        titulo = request.form.get('principalTarefaTituloQuickAdd')
        disciplina_id = request.form.get('principalTarefaDisciplinaQuickAdd')
        data_str = request.form.get('principalTarefaDataEntregaQuickAdd')
        tipo_str = request.form.get('principalTarefaTipoQuickAdd')
        status_str = request.form.get('principalTarefaStatusQuickAdd')
        descricao = request.form.get('principalTarefaDescricaoQuickAdd')

        # Validação e conversão dos dados
        if not all([titulo, disciplina_id, data_str, tipo_str, status_str]):
            flash('Todos os campos obrigatórios devem ser preenchidos.', 'danger')
            # request.referrer volta para a página de onde o usuário veio
            return redirect(request.referrer or url_for('rota_dashboard'))

        # Converte a string da data para um objeto date do Python
        data_entrega = datetime.strptime(data_str, '%Y-%m-%d').date()

        # Converte as strings de tipo e status para os Enums
        from models import TipoTarefa, StatusTarefa
        tipo_enum = TipoTarefa[tipo_str.upper()]

        # Mapeamento explícito e seguro dos status
        status_map = {
            "A_FAZER": StatusTarefa.A_FAZER,
            "ANDAMENTO": StatusTarefa.ANDAMENTO,
            "CONCLUIDA": StatusTarefa.CONCLUIDA
        }
        # Usamos .get() para buscar no mapa. Retorna None se a chave não existir.
        status_enum = status_map.get(status_str.upper())

        # Verificação de segurança: se um status inválido for enviado
        if status_enum is None:
            flash(f"Status inválido recebido: {status_str}", 'danger')
            return redirect(request.referrer or url_for('rota_dashboard'))

        # Cria a nova tarefa
        nova_tarefa = Tarefa(
            titulo=titulo,
            descricao=descricao,
            data_entrega=data_entrega,
            tipo=tipo_enum,
            status=status_enum,
            disciplina_id=int(disciplina_id)
        )

        db.session.add(nova_tarefa)
        db.session.commit()

        # flash('Atividade criada com sucesso!', 'success')
        # Redireciona para a lista de tarefas para ver o resultado
        return redirect(request.referrer or url_for('rota_dashboard'))


    @app.route('/api/atividade/<int:atividade_id>')
    def api_get_atividade(atividade_id):
        # Garante que o usuário está logado
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        # Busca a atividade, garantindo que ela pertence a uma disciplina do usuário logado.
        # Esta é uma verificação de segurança crucial.
        atividade = db.session.query(Tarefa).join(Disciplina).filter(
            Tarefa.id == atividade_id,
            Disciplina.usuario_id == session['user_id']
        ).first()

        if atividade:
            return jsonify({
                "id": atividade.id,
                "titulo": atividade.titulo,
                "descricao": atividade.descricao,
                # ALTERADO: Retorna a data no formato YYYY-MM-DD
                "data_entrega": atividade.data_entrega.isoformat(),
                "status": atividade.status.name,
                "tipo": atividade.tipo.name,
                "disciplina_id": atividade.disciplina.id, # Adicionado para preencher o select
                "disciplina_nome": atividade.disciplina.nome
            })
        else:
            return jsonify({"error": "Atividade não encontrada"}), 404

    @app.route('/tarefas/atualizar/<int:tarefa_id>', methods=['POST'])
    def atualizar_tarefa(tarefa_id):
        if 'user_id' not in session:
            flash('Você precisa estar logado para editar uma tarefa.', 'warning')
            return redirect(url_for('rota_login'))

        # Busca a tarefa no banco, garantindo que pertence ao usuário logado
        tarefa = db.session.query(Tarefa).join(Disciplina).filter(
            Tarefa.id == tarefa_id,
            Disciplina.usuario_id == session['user_id']
        ).first_or_404()

        # Pega os dados do formulário (os mesmos nomes do modal de criação)
        tarefa.titulo = request.form.get('principalTarefaTituloQuickAdd')
        tarefa.disciplina_id = int(request.form.get('principalTarefaDisciplinaQuickAdd'))
        tarefa.data_entrega = datetime.strptime(request.form.get('principalTarefaDataEntregaQuickAdd'), '%Y-%m-%d').date()
        tarefa.tipo = TipoTarefa[request.form.get('principalTarefaTipoQuickAdd').upper()]
        tarefa.descricao = request.form.get('principalTarefaDescricaoQuickAdd')

        # Mapeamento seguro de status
        status_map = {
            "A_FAZER": StatusTarefa.A_FAZER,
            "ANDAMENTO": StatusTarefa.ANDAMENTO,
            "CONCLUIDA": StatusTarefa.CONCLUIDA
        }
        tarefa.status = status_map.get(request.form.get('principalTarefaStatusQuickAdd').upper(), tarefa.status)
        
        db.session.commit()
        # flash('Tarefa atualizada com sucesso!', 'success')
        return redirect(url_for('rota_tarefas'))



    def formatar_usuario_json(usuario):
        return {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email
        }

    @app.route('/disciplinas')
    def rota_disciplinas():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            session.clear()
            return redirect(url_for('rota_login'))

        disciplinas = Disciplina.query.filter_by(usuario_id=session['user_id']).all()
        
        disciplinas_json = [{
            "id": d.id,
            "nome": d.nome,
            "descricao": d.descricao or "",
            "professor": d.professor or "-",
            "periodo": d.periodo or "",
            "status": d.status.value
        } for d in disciplinas]

        return render_template('disciplinas.html', disciplinas=disciplinas_json, usuario=formatar_usuario_json(usuario))

    # --- ROTAS DE API PARA DISCIPLINAS ---
    
    @app.route('/api/disciplinas', methods=['GET'])
    def api_get_disciplinas():
        """Retorna todas as disciplinas do usuário logado"""
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        disciplinas = Disciplina.query.filter_by(usuario_id=session['user_id']).all()
        
        disciplinas_json = [{
            "id": d.id,
            "nome": d.nome,
            "descricao": d.descricao or "",
            "professor": d.professor or "-",
            "periodo": d.periodo or "",
            "status": d.status.value
        } for d in disciplinas]
        
        return jsonify(disciplinas_json)

    @app.route('/api/disciplinas', methods=['POST'])
    def api_criar_disciplina():
        """Cria uma nova disciplina"""
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        try:
            data = request.get_json()
            
            if not data.get('nome'):
                return jsonify({"error": "Nome da disciplina é obrigatório"}), 400
            
            if not data.get('periodo'):
                return jsonify({"error": "Período é obrigatório"}), 400
            
            if not data.get('status'):
                return jsonify({"error": "Status é obrigatório"}), 400

            status_map = {
                "Ativa": StatusDisciplina.ATIVA,
                "Em Andamento": StatusDisciplina.ANDAMENTO,
                "Concluída": StatusDisciplina.CONCLUIDA,
                "Agendada": StatusDisciplina.ATIVA 
            }
            
            status_enum = status_map.get(data.get('status'), StatusDisciplina.ATIVA)

            nova_disciplina = Disciplina(
                nome=data.get('nome'),
                descricao=data.get('descricao', ''),
                professor=data.get('professor', ''),
                periodo=data.get('periodo'),
                status=status_enum,
                usuario_id=session['user_id']
            )

            db.session.add(nova_disciplina)
            db.session.commit()

            return jsonify({
                "id": nova_disciplina.id,
                "nome": nova_disciplina.nome,
                "descricao": nova_disciplina.descricao or "",
                "professor": nova_disciplina.professor or "-",
                "periodo": nova_disciplina.periodo or "",
                "status": nova_disciplina.status.value,
                "message": "Disciplina criada com sucesso!"
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao criar disciplina: {str(e)}"}), 500

    @app.route('/api/disciplinas/<int:disciplina_id>', methods=['PUT'])
    def api_atualizar_disciplina(disciplina_id):
        """Atualiza uma disciplina existente"""
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        try:
            disciplina = Disciplina.query.filter_by(
                id=disciplina_id, 
                usuario_id=session['user_id']
            ).first()

            if not disciplina:
                return jsonify({"error": "Disciplina não encontrada"}), 404

            data = request.get_json()
            
            if not data.get('nome'):
                return jsonify({"error": "Nome da disciplina é obrigatório"}), 400
            
            if not data.get('periodo'):
                return jsonify({"error": "Período é obrigatório"}), 400
            
            if not data.get('status'):
                return jsonify({"error": "Status é obrigatório"}), 400

            status_map = {
                "Ativa": StatusDisciplina.ATIVA,
                "Em Andamento": StatusDisciplina.ANDAMENTO,
                "Concluída": StatusDisciplina.CONCLUIDA,
                "Agendada": StatusDisciplina.ATIVA 
            }
            
            status_enum = status_map.get(data.get('status'), StatusDisciplina.ATIVA)

            disciplina.nome = data.get('nome')
            disciplina.descricao = data.get('descricao', '')
            disciplina.professor = data.get('professor', '')
            disciplina.periodo = data.get('periodo')
            disciplina.status = status_enum

            db.session.commit()

            return jsonify({
                "id": disciplina.id,
                "nome": disciplina.nome,
                "descricao": disciplina.descricao or "",
                "professor": disciplina.professor or "-",
                "periodo": disciplina.periodo or "",
                "status": disciplina.status.value,
                "message": "Disciplina atualizada com sucesso!"
            })

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao atualizar disciplina: {str(e)}"}), 500

    @app.route('/api/disciplinas/<int:disciplina_id>', methods=['DELETE'])
    def api_deletar_disciplina(disciplina_id):
        """Deleta uma disciplina"""
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        try:
            disciplina = Disciplina.query.filter_by(
                id=disciplina_id, 
                usuario_id=session['user_id']
            ).first()

            if not disciplina:
                return jsonify({"error": "Disciplina não encontrada"}), 404

            db.session.delete(disciplina)
            db.session.commit()

            return jsonify({"message": "Disciplina removida com sucesso!"})

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Erro ao remover disciplina: {str(e)}"}), 500

    @app.route('/api/disciplina/<int:disciplina_id>')
    def api_get_disciplina(disciplina_id):
        # Garante que o usuário está logado
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        disciplina = Disciplina.query.filter_by(id=disciplina_id, usuario_id=session['user_id']).first()

        if disciplina:
            return jsonify({
                "id": disciplina.id,
                "nome": disciplina.nome,
                "descricao": disciplina.descricao,
                "professor": disciplina.professor,
                "periodo": disciplina.periodo,
                "status": disciplina.status.value 
            })
        else:
            return jsonify({"error": "Disciplina não encontrada"}), 404

    @app.route('/calendario')
    def rota_calendario():
        return render_template('calendario.html')

    # Em app.py

    @app.route('/anotacao')
    def rota_anotacao():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])
        
        # 1. Busca todos os dados necessários do banco
        disciplinas = Disciplina.query.filter_by(usuario_id=session['user_id']).all()
        
        ids_disciplinas_usuario = [d.id for d in disciplinas]
        tarefas = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).all()
        anotacoes = Anotacao.query.join(Disciplina).filter(Disciplina.usuario_id == session['user_id']).order_by(Anotacao.data_criacao.desc()).all()

<<<<<<< HEAD
        # 2. Formata os dados para serem usados como JSON no frontend
        disciplinas_json = [{"id": d.id, "nome": d.nome} for d in disciplinas]
        tarefas_json = [{"id": t.id, "titulo": t.titulo, "disciplinaId": t.disciplina_id} for t in tarefas]
        anotacoes_json = [{
            "id": a.id, "titulo": a.titulo, "disciplinaId": a.disciplina_id,
            "atividadeVinculadaId": a.tarefa_id, "conteudo": a.conteudo,
            "dataCriacao": a.data_criacao.isoformat(),
            "ultimaModificacao": a.data_criacao.isoformat()
        } for a in anotacoes]

        # 3. Renderiza o template, passando os dados formatados
        return render_template(
            'anotacao.html', 
            usuario=formatar_usuario_json(usuario),
            initial_anotacoes=anotacoes_json,
            initial_disciplinas=disciplinas_json,
            initial_tarefas=tarefas_json
        )
=======
        # Pega os IDs de todas as disciplinas do usuário
        ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
        
        # Filtro por disciplina se especificado
        disciplina_id_filtro = request.args.get('disciplina_id', type=int)
        if disciplina_id_filtro:
            # Verifica se a disciplina pertence ao usuário
            if disciplina_id_filtro in ids_disciplinas_usuario:
                anotacoes = Anotacao.query.filter(
                    Anotacao.usuario_id == session['user_id'],
                    Anotacao.disciplina_id == disciplina_id_filtro
                ).all()
            else:
                # Se a disciplina não pertence ao usuário, limpa o filtro
                disciplina_id_filtro = None
                anotacoes = Anotacao.query.filter(Anotacao.usuario_id == session['user_id']).all()
        else:
            anotacoes = Anotacao.query.filter(Anotacao.usuario_id == session['user_id']).all()

        return render_template('anotacao.html', 
                            anotacoes=anotacoes, 
                            usuario=formatar_usuario_json(usuario),
                            disciplina_filtro_id=disciplina_id_filtro) # Passa o ID da disciplina filtrada
>>>>>>> 2644b5b9555fa1e032a51266b9f52308b51deb78
    
    # Em app.py, modifique a rota /anotacoes/criar

    @app.route('/anotacoes/criar', methods=['POST'])
    def criar_anotacao():
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Não autorizado'}), 401

        try:
            # Pega os dados do formulário específico do modal de anotação
            titulo = request.form.get('principalAnotacaoTitulo')
            conteudo = request.form.get('principalAnotacaoConteudo')
            disciplina_id = request.form.get('principalAnotacaoDisciplina')
            tarefa_id = request.form.get('principalAnotacaoAtividade')

            if not titulo:
                return jsonify({'success': False, 'error': 'O título é obrigatório.'}), 400

            nova_anotacao = Anotacao(
                titulo=titulo,
                conteudo=conteudo,
                disciplina_id=int(disciplina_id) if disciplina_id else None,
                tarefa_id=int(tarefa_id) if tarefa_id else None
                # O model de Anotacao deve cuidar do usuario_id ou ser relacionado via disciplina
            )

<<<<<<< HEAD
            # Assumindo que a relação Anotacao -> Disciplina -> Usuario existe
            # Se não, você pode precisar adicionar o usuario_id diretamente na Anotacao
=======
        nova_anotacao = Anotacao(
            titulo=titulo,
            conteudo=conteudo,
            usuario_id=session['user_id'],
            disciplina_id=disciplina_id,
            tarefa_id=tarefa_id
        )
>>>>>>> 2644b5b9555fa1e032a51266b9f52308b51deb78

            db.session.add(nova_anotacao)
            db.session.commit()

            # Retorna o objeto criado como JSON
            return jsonify({
                'success': True,
                'message': 'Anotação criada com sucesso!',
                'anotacao': {
                    'id': nova_anotacao.id,
                    'titulo': nova_anotacao.titulo,
                    'disciplinaId': nova_anotacao.disciplina_id,
                    'atividadeVinculadaId': nova_anotacao.tarefa_id,
                    'conteudo': nova_anotacao.conteudo,
                    'dataCriacao': nova_anotacao.data_criacao.isoformat(),
                    'ultimaModificacao': nova_anotacao.data_criacao.isoformat()
                }
            }), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500

    @app.route('/esqueceu_senha')
    def rota_esqueceu_senha():
        return render_template('esqueceu_senha.html')

    @app.route('/codigo')
    def rota_codigo():
        return render_template('codigo.html')

    @app.route('/api/anotacoes/<int:anotacao_id>', methods=['POST'])
    def api_atualizar_anotacao(anotacao_id):
        """Atualiza uma anotação existente."""
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Não autorizado'}), 401
        
        try:
            # Garante que a anotação existe e pertence ao usuário
            anotacao = db.session.query(Anotacao).join(Disciplina).filter(
                Anotacao.id == anotacao_id,
                Disciplina.usuario_id == session['user_id']
            ).first()

            if not anotacao:
                return jsonify({'success': False, 'error': 'Anotação não encontrada'}), 404

            # Pega os dados do formulário
            anotacao.titulo = request.form.get('principalAnotacaoTitulo')
            anotacao.conteudo = request.form.get('principalAnotacaoConteudo')
            
            disciplina_id = request.form.get('principalAnotacaoDisciplina')
            anotacao.disciplina_id = int(disciplina_id) if disciplina_id else None
            
            tarefa_id = request.form.get('principalAnotacaoAtividade')
            anotacao.tarefa_id = int(tarefa_id) if tarefa_id else None

            db.session.commit()
            
            # Retorna a anotação atualizada
            return jsonify({
                'success': True,
                'message': 'Anotação atualizada com sucesso!',
                'anotacao': {
                    'id': anotacao.id,
                    'titulo': anotacao.titulo,
                    'disciplinaId': anotacao.disciplina_id,
                    'atividadeVinculadaId': anotacao.tarefa_id,
                    'conteudo': anotacao.conteudo,
                    'dataCriacao': anotacao.data_criacao.isoformat(),
                    'ultimaModificacao': anotacao.data_modificacao.isoformat()
                }
            })

        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500


    @app.route('/api/anotacoes/<int:anotacao_id>', methods=['DELETE'])
    def api_deletar_anotacao(anotacao_id):
        """Deleta uma anotação."""
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Não autorizado'}), 401
        
        try:
            # Garante que a anotação existe e pertence ao usuário
            anotacao = db.session.query(Anotacao).join(Disciplina).filter(
                Anotacao.id == anotacao_id,
                Disciplina.usuario_id == session['user_id']
            ).first()

            if not anotacao:
                return jsonify({'success': False, 'error': 'Anotação não encontrada'}), 404

            db.session.delete(anotacao)
            db.session.commit()
            
            return jsonify({'success': True, 'message': 'Anotação removida com sucesso!'})

        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'error': str(e)}), 500
    

    return app









# Ponto de entrada para rodar a aplicação
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

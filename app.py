import os
from datetime import datetime, date
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from dotenv import load_dotenv
from extensions import db
from models import Usuario, Disciplina, Tarefa, Anotacao, StatusDisciplina, StatusTarefa

from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from flask import jsonify # Para retornar respostas em JSON

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

def create_app():
    """
    Cria e configura uma instância da aplicação Flask.
    """
    app = Flask(__name__)

    # Configuração do banco de dados a partir do .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

    # Configuracao do JWT
    jwt = JWTManager(app)

    # Inicializa o db com a aplicação
    db.init_app(app)

    # --- REGISTRO DO COMANDO CUSTOMIZADO ---
    @app.cli.command("create-db")
    def create_db_command():
        """Cria as tabelas do banco de dados a partir dos modelos."""
        with app.app_context():
            db.create_all()
        print("Tabelas criadas com sucesso!")


    # --- ADICIONAR USUÁRIO ADMIN ---
    @app.cli.command("seed-admin")
    def seed_admin_command():
        """Cria um usuário administrador padrão."""
        with app.app_context():
            # Verifica se o admin já existe
            admin_user = Usuario.query.filter_by(email="admin@admin.com").first()
            if admin_user:
                print("Usuário admin já existe.")
                return

            # Cria o novo usuário admin
            new_admin = Usuario(nome="Admin", email="admin@admin.com")
            new_admin.set_senha("1234") # A senha será criptografada pelo método set_senha

            db.session.add(new_admin)
            db.session.commit()
            print("Usuário admin criado com sucesso!")
    # ----------------------------------------




    # --- ROTAS DA APLICAÇÃO ---
    @app.route('/', methods=['GET', 'POST'])
    def rota_login():
        if request.method == 'POST':
            email = request.form.get('email')
            senha = request.form.get('senha')

            # Busca o usuário no banco de dados pelo email fornecido
            user = Usuario.query.filter_by(email=email).first()

            # Verifica se o usuário existe E se a senha fornecida corresponde à senha no banco
            if user and user.check_senha(senha):
                # Se as credenciais estiverem corretas, armazena o ID do usuário na sessão
                session['user_id'] = user.id
                # Redireciona para o dashboard
                return redirect(url_for('rota_dashboard'))
            else:
                # Se as credenciais estiverem erradas, envia uma mensagem de erro para o front-end
                flash('Email ou senha inválidos. Tente novamente.')

        return render_template('login.html')
    
    
    @app.route('/logout')
    def rota_logout():
        # Limpa a sessão, removendo o user_id
        session.clear()
        # Redireciona para a página de login
        return redirect(url_for('rota_login'))



    @app.route('/cadastro', methods=['GET', 'POST'])
    def rota_cadastro():
        if request.method == 'POST':
            nome = request.form.get('nome')
            email = request.form.get('email')
            senha = request.form.get('senha')

            # Validação básica no servidor
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
    



    @app.route('/dashboard')
    def rota_dashboard():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            session.clear()
            return redirect(url_for('rota_login'))

        ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
        
        # 1. Busca todas as atividades, a ordenação inicial por data ainda é útil
        atividades = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).order_by(Tarefa.data_entrega).all()

        # 2. Lógica para identificar tarefas atrasadas (já implementada)
        hoje = date.today()
        for atividade in atividades:
            if atividade.data_entrega < hoje and atividade.status != StatusTarefa.CONCLUIDA:
                atividade.status = StatusTarefa.ATRASADA
                
        # --- NOVA LÓGICA DE ORDENAÇÃO COM PRIORIDADE ---

        # 3. Define a ordem de prioridade para cada status (números menores são mais importantes)
        prioridade_status = {
            StatusTarefa.ATRASADA: 0,
            StatusTarefa.A_FAZER: 2,
            StatusTarefa.ANDAMENTO: 1,
            StatusTarefa.CONCLUIDA: 3
        }

        # 4. Ordena a lista 'atividades' usando a prioridade do status primeiro, e a data de entrega como critério de desempate
        atividades_ordenadas = sorted(
            atividades, 
            key=lambda x: (prioridade_status.get(x.status, 99), x.data_entrega)
        )
        
        # --- FIM DA NOVA LÓGICA ---

        # 5. Filtra e fatia a lista JÁ ORDENADA para pegar as 4 principais tarefas e provas
        tarefas_dashboard = [t for t in atividades_ordenadas if t.tipo.name == 'TAREFA'][:4]
        provas_dashboard = [p for p in atividades_ordenadas if p.tipo.name == 'PROVA'][:4]

        return render_template(
            'principal.html', 
            usuario=usuario, 
            disciplinas=usuario.disciplinas,
            tarefas_dashboard=tarefas_dashboard,
            provas_dashboard=provas_dashboard
        )
    
    @app.route('/disciplinas/criar', methods=['POST'])
    def criar_disciplina():
        if 'user_id' not in session:
            flash('Você precisa estar logado para criar uma disciplina.', 'warning')
            return redirect(url_for('rota_login'))

        # Pega os dados enviados pelo formulário do modal
        nome = request.form.get('principalDisciplinaNome')
        professor = request.form.get('principalDisciplinaProfessor')
        periodo = request.form.get('principalDisciplinaPeriodo')
        status_str = request.form.get('principalDisciplinaStatus')

        # Mapeia o texto do formulário para o membro do Enum correto
        status_map = {
            "Ativa": StatusDisciplina.ATIVA,
            "Em Andamento": StatusDisciplina.ANDAMENTO,
            "Concluída": StatusDisciplina.CONCLUIDA
        }
        # Pega o Enum do mapa, usando 'ATIVA' como padrão se algo der errado
        status_enum = status_map.get(status_str, StatusDisciplina.ATIVA)

        # Cria uma nova instância da classe Disciplina
        nova_disciplina = Disciplina(
            nome=nome,
            professor=professor,
            periodo=periodo,
            status=status_enum,
            usuario_id=session['user_id'] # MUITO IMPORTANTE: Associa a disciplina ao usuário logado
        )

        # Salva no banco de dados
        db.session.add(nova_disciplina)
        db.session.commit()

        # flash('Disciplina adicionada com sucesso!', 'success')
        return redirect(request.referrer or url_for('rota_dashboard'))


    @app.route('/tarefas')
    def rota_tarefas():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            session.clear()
            return redirect(url_for('rota_login'))

        ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
        tarefas_do_usuario = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).order_by(Tarefa.data_entrega).all()

        return render_template('tarefas.html', tarefas=tarefas_do_usuario, usuario=usuario)
    

    
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
            "A FAZER": StatusTarefa.A_FAZER,
            "EM ANDAMENTO": StatusTarefa.ANDAMENTO,
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
                "data_entrega": atividade.data_entrega.strftime('%d/%m/%Y'),
                "status": atividade.status.name,  # <-- ALTERADO AQUI
                "tipo": atividade.tipo.name,      # <-- ALTERADO AQUI
                "disciplina_nome": atividade.disciplina.nome
            })
        else:
            # Se não encontrou ou não pertence ao usuário, retorna um erro
            return jsonify({"error": "Atividade não encontrada"}), 404




    @app.route('/disciplinas')
    def rota_disciplinas():
        return render_template('disciplinas.html')
    

    # --- ROTAS DE API ---
    @app.route('/api/disciplina/<int:disciplina_id>')
    def api_get_disciplina(disciplina_id):
        # Garante que o usuário está logado
        if 'user_id' not in session:
            return jsonify({"error": "Não autorizado"}), 401

        # Busca a disciplina no banco, garantindo que ela pertence ao usuário logado
        disciplina = Disciplina.query.filter_by(id=disciplina_id, usuario_id=session['user_id']).first()

        if disciplina:
            # Se encontrou, retorna os dados da disciplina em formato JSON
            return jsonify({
                "id": disciplina.id,
                "nome": disciplina.nome,
                "descricao": disciplina.descricao,
                "professor": disciplina.professor,
                "periodo": disciplina.periodo,
                "status": disciplina.status.value # Retorna o valor do Enum (ex: "EM ANDAMENTO")
            })
        else:
            # Se não encontrou ou não pertence ao usuário, retorna um erro
            return jsonify({"error": "Disciplina não encontrada"}), 404

    @app.route('/calendario')
    def rota_calendario():
        return render_template('calendario.html')

    @app.route('/anotacao')
    def rota_anotacao():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        usuario = Usuario.query.get(session['user_id'])

        # Pega os IDs de todas as disciplinas do usuário
        ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]

        # Busca todas as anotações que estão ligadas diretamente a uma disciplina do usuário
        # OU que não estão ligadas a nenhuma disciplina (anotações gerais)
        # (Uma consulta mais complexa pode ser necessária para anotações de tarefas)
        anotacoes = Anotacao.query.join(Disciplina).filter(Disciplina.usuario_id == session['user_id']).all()

        return render_template('anotacao.html', anotacoes=anotacoes, usuario=usuario)
    
    @app.route('/anotacoes/criar', methods=['POST'])
    def criar_anotacao():
        if 'user_id' not in session:
            return redirect(url_for('rota_login'))

        # Pega os dados do formulário
        titulo = request.form.get('principalAnotacaoTitulo')
        conteudo = request.form.get('principalAnotacaoConteudo') # O TinyMCE atualiza o textarea com este name
        disciplina_id = request.form.get('principalAnotacaoDisciplina')
        tarefa_id = request.form.get('principalAnotacaoAtividade')

        if not titulo:
            # Em uma implementação real, trataríamos o erro de forma mais elegante
            return "O título é obrigatório.", 400

        # Converte para int ou None se estiver vazio
        disciplina_id = int(disciplina_id) if disciplina_id else None
        tarefa_id = int(tarefa_id) if tarefa_id else None

        nova_anotacao = Anotacao(
            titulo=titulo,
            conteudo=conteudo,
            disciplina_id=disciplina_id,
            tarefa_id=tarefa_id
        )

        db.session.add(nova_anotacao)
        db.session.commit()

        # Redireciona para a página de anotações para ver o resultado
        return redirect(request.referrer or url_for('rota_dashboard'))

    @app.route('/esqueceu_senha')
    def rota_esqueceu_senha():
        return render_template('esqueceu_senha.html')

    @app.route('/codigo')
    def rota_codigo():
        return render_template('codigo.html')

    # -------------------------

    return app






# Ponto de entrada para rodar a aplicação
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)

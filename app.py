import os
from flask import Flask, render_template, request, redirect, url_for, session, flash
from dotenv import load_dotenv
from extensions import db
from models import Usuario, Disciplina, Tarefa, Anotacao

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
        # Verifica se o 'user_id' está na sessão
        if 'user_id' not in session:
            # Se não estiver, redireciona para a página de login
            return redirect(url_for('rota_login'))

        # Se estiver logado, mostra o dashboard
        return render_template('principal.html')
    



    @app.route('/tarefas')
    def rota_tarefas():
        return render_template('tarefas.html')

    @app.route('/disciplinas')
    def rota_disciplinas():
        return render_template('disciplinas.html')

    @app.route('/calendario')
    def rota_calendario():
        return render_template('calendario.html')

    @app.route('/anotacao')
    def rota_anotacao():
        return render_template('anotacao.html')

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

import os
from flask import Flask
from dotenv import load_dotenv
from flask_migrate import Migrate
from .extensions import db 
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
    
    app.config['UPLOAD_FOLDER'] = 'static/uploads'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)
    Migrate(app, db)
    oauth = OAuth(app)
    jwt = JWTManager(app)

    oauth.register(
        name='google',
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

    from .views import auth, dashboard, disciplinas, tarefas, anotacoes, configuracoes, notificacoes, outras_rotas
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(disciplinas.bp)
    app.register_blueprint(tarefas.bp)
    app.register_blueprint(anotacoes.bp)
    app.register_blueprint(configuracoes.bp)
    app.register_blueprint(notificacoes.bp)
    app.register_blueprint(outras_rotas.bp)

    @app.cli.command("create-db")
    def create_db_command():
        """Cria as tabelas do banco de dados a partir dos modelos."""
        with app.app_context():
            db.create_all()
        print("Tabelas criadas com sucesso!")

    @app.cli.command("seed-admin")
    def seed_admin_command():
        """Cria um usuário administrador padrão."""
        from .models import Usuario 
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

    @app.cli.command("update-db")
    def update_db_command():
        """Atualiza o banco de dados com as novas colunas."""
        with app.app_context():
            try:
                with db.engine.connect() as conn:
                    inspector = db.inspect(db.engine)
                    existing_columns = [col['name'] for col in inspector.get_columns('usuario')]
                    
                    if 'foto_perfil' not in existing_columns:
                        conn.execute(db.text("ALTER TABLE usuario ADD COLUMN foto_perfil VARCHAR(255)"))
                        print("Coluna 'foto_perfil' adicionada.")
                    
                    if 'email_notificacoes' not in existing_columns:
                        conn.execute(db.text("ALTER TABLE usuario ADD COLUMN email_notificacoes BOOLEAN DEFAULT TRUE"))
                        print("Coluna 'email_notificacoes' adicionada.")
                    
                    if 'app_notificacoes' not in existing_columns:
                        conn.execute(db.text("ALTER TABLE usuario ADD COLUMN app_notificacoes BOOLEAN DEFAULT TRUE"))
                        print("Coluna 'app_notificacoes' adicionada.")
                    
                    if 'frequencia_notificacoes' not in existing_columns:
                        conn.execute(db.text("ALTER TABLE usuario ADD COLUMN frequencia_notificacoes VARCHAR(20) DEFAULT 'instant'"))
                        print("Coluna 'frequencia_notificacoes' adicionada.")
                    
                    if 'token_confirmacao' not in existing_columns:
                        conn.execute(db.text("ALTER TABLE usuario ADD COLUMN token_confirmacao VARCHAR(255)"))
                        print("Coluna 'token_confirmacao' adicionada.")
                    
                    if 'token_expiracao' not in existing_columns:
                        conn.execute(db.text("ALTER TABLE usuario ADD COLUMN token_expiracao DATETIME"))
                        print("Coluna 'token_expiracao' adicionada.")
                    
                print("Banco de dados atualizado com sucesso!")
                
            except Exception as e:
                print(f"Erro ao atualizar banco de dados: {e}")

    return app


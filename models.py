# models.py
import enum
from extensions import db # CORREÇÃO APLICADA AQUI
from werkzeug.security import generate_password_hash, check_password_hash

# Definição dos Enums para Status e Tipos
class StatusDisciplina(enum.Enum):
    ATIVA = "ATIVA"
    CONCLUIDA = "CONCLUÍDA"
    ANDAMENTO = "EM ANDAMENTO"

class StatusTarefa(enum.Enum):
    A_FAZER = "A FAZER"
    ANDAMENTO = "EM ANDAMENTO"
    CONCLUIDA = "CONCLUÍDA"
    ATRASADA = "Atrasada"

class TipoTarefa(enum.Enum):
    TAREFA = "TAREFA"
    PROVA = "PROVA"

class TipoNotificacao(enum.Enum):
    TAREFA = "TAREFA"
    PROVA = "PROVA"
    DISCIPLINA = "DISCIPLINA"
    SISTEMA = "SISTEMA"

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    foto_perfil = db.Column(db.String(255), nullable=True)  # Caminho para a foto
    email_notificacoes = db.Column(db.Boolean, default=True)  # Notificações por email
    app_notificacoes = db.Column(db.Boolean, default=True)  # Notificações no app
    frequencia_notificacoes = db.Column(db.String(20), default='instant')  # instant, daily, weekly
    token_confirmacao = db.Column(db.String(255), nullable=True)  # Token para confirmar mudanças
    token_expiracao = db.Column(db.DateTime, nullable=True)  # Expiração do token
    
    disciplinas = db.relationship('Disciplina', backref='usuario', lazy=True, cascade="all, delete-orphan")
    anotacoes = db.relationship('Anotacao', backref='usuario', lazy=True, cascade="all, delete-orphan")
    notificacoes = db.relationship('Notificacao', backref='usuario', lazy=True, cascade="all, delete-orphan")

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha, method='pbkdf2:sha256')

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

    def gerar_token_confirmacao(self):
        """Gera um token único para confirmar mudanças"""
        import secrets
        import datetime
        self.token_confirmacao = secrets.token_urlsafe(32)
        self.token_expiracao = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        return self.token_confirmacao

    def verificar_token(self, token):
        """Verifica se o token é válido e não expirou"""
        if not self.token_confirmacao or not self.token_expiracao:
            return False
        if self.token_confirmacao != token:
            return False
        if datetime.datetime.utcnow() > self.token_expiracao:
            return False
        return True

    def limpar_token(self):
        """Limpa o token após uso"""
        self.token_confirmacao = None
        self.token_expiracao = None

    def criar_notificacao(self, titulo, mensagem, tipo=TipoNotificacao.SISTEMA, lida=False):
        """Cria uma nova notificação para o usuário"""
        from datetime import datetime
        notificacao = Notificacao(
            titulo=titulo,
            mensagem=mensagem,
            tipo=tipo,
            lida=lida,
            usuario_id=self.id
        )
        db.session.add(notificacao)
        return notificacao

class Disciplina(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    professor = db.Column(db.String(150), nullable=True)
    periodo = db.Column(db.String(50), nullable=True)
    status = db.Column(db.Enum(StatusDisciplina), default=StatusDisciplina.ATIVA, nullable=False)
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    
    tarefas = db.relationship('Tarefa', backref='disciplina', lazy=True, cascade="all, delete-orphan")
    anotacoes = db.relationship('Anotacao', backref='disciplina', lazy=True, cascade="all, delete-orphan")

class Tarefa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    data_entrega = db.Column(db.Date, nullable=False)
    status = db.Column(db.Enum(StatusTarefa), default=StatusTarefa.A_FAZER, nullable=False)
    tipo = db.Column(db.Enum(TipoTarefa), default=TipoTarefa.TAREFA, nullable=False)
    
    disciplina_id = db.Column(db.Integer, db.ForeignKey('disciplina.id'), nullable=True)
    
    anotacoes = db.relationship('Anotacao', backref='tarefa', lazy=True, cascade="all, delete-orphan")

class Anotacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, server_default=db.func.now())
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    disciplina_id = db.Column(db.Integer, db.ForeignKey('disciplina.id'), nullable=True)
    tarefa_id = db.Column(db.Integer, db.ForeignKey('tarefa.id'), nullable=True)

class Notificacao(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    tipo = db.Column(db.Enum(TipoNotificacao), default=TipoNotificacao.SISTEMA, nullable=False)
    lida = db.Column(db.Boolean, default=False, nullable=False)
    data_criacao = db.Column(db.DateTime, server_default=db.func.now())
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)

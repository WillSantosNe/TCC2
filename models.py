# models.py
from datetime import datetime
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

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    
    disciplinas = db.relationship('Disciplina', backref='usuario', lazy=True, cascade="all, delete-orphan")
    anotacoes = db.relationship('Anotacao', backref='usuario', lazy=True, cascade="all, delete-orphan")

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha, method='pbkdf2:sha256')

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)

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
    data_modificacao = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    disciplina_id = db.Column(db.Integer, db.ForeignKey('disciplina.id'), nullable=True)
    tarefa_id = db.Column(db.Integer, db.ForeignKey('tarefa.id'), nullable=True)

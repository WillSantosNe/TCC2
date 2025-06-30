import os
from dotenv import load_dotenv
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

load_dotenv() # Carrega as variáveis do arquivo .env

# Cria a instância da aplicação Flask
app = Flask(__name__)

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
# Conecta ao banco de dados MySQL 'studyflow_db' que você criou no Workbench.
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa a extensão SQLAlchemy com a aplicação
db = SQLAlchemy(app)
# ------------------------------------


# --- MODELOS DO BANCO DE DADOS ---
# Esta classe define a estrutura da tabela 'usuario' no banco de dados.
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False) # Armazenará a senha criptografada

# Futuramente, as classes para Disciplina, Tarefa, etc., virão aqui.
# ------------------------------------


# --- ROTAS DA APLICAÇÃO ---
@app.route('/')
def rota_login():
    return render_template('login.html')

@app.route('/cadastro')
def rota_cadastro():
    return render_template('cadastro.html')

@app.route('/dashboard')
def rota_dashboard():
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

# ------------------------------------

# Permite executar o servidor rodando o script com 'python app.py'
if __name__ == '__main__':
    app.run(debug=True)

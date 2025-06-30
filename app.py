from flask import Flask, render_template

# Cria a instância da aplicação Flask
app = Flask(__name__)

# Rota para a página de login (página inicial)
@app.route('/')
def rota_login():
    return render_template('login.html')

# Rota para a página de cadastro
@app.route('/cadastro')
def rota_cadastro():
    return render_template('cadastro.html')

@app.route('/dashboard')
def rota_dashboard():
    return render_template('principal.html')





# --- ROTAS ADICIONAIS (BÔNUS) ---

# Rota para a página de tarefas
@app.route('/tarefas')
def rota_tarefas():
    return render_template('tarefas.html')

# Rota para a página de disciplinas
@app.route('/disciplinas')
def rota_disciplinas():
    return render_template('disciplinas.html')

# Rota para a página de calendário
@app.route('/calendario')
def rota_calendario():
    return render_template('calendario.html')

# Rota para a página de anotações
@app.route('/anotacao')
def rota_anotacao():
    return render_template('anotacao.html')

# Rota para a página de esqueci a senha
@app.route('/esqueceu_senha')
def rota_esqueceu_senha():
    return render_template('esqueceu_senha.html')

# Rota para o código de redefinição de senha
@app.route('/codigo')
def rota_codigo():
    return render_template('codigo.html')

# Permite executar o servidor rodando o script com 'python app.py'
if __name__ == '__main__':
    app.run(debug=True)

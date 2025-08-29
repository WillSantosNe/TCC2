from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from ..models import Usuario
from ..extensions import db
from authlib.integrations.flask_client import OAuth

bp = Blueprint('auth', __name__)

@bp.route('/', methods=['GET', 'POST'])
def rota_login():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')
        user = Usuario.query.filter_by(email=email).first()
        if user and user.check_senha(senha):
            session['user_id'] = user.id
            return redirect(url_for('dashboard.rota_dashboard'))
        else:
            flash('Email ou senha inválidos. Tente novamente.', 'danger')
    return render_template('login.html')

@bp.route('/logout')
def rota_logout():
    session.clear()
    return redirect(url_for('auth.rota_login'))

@bp.route('/cadastro', methods=['GET', 'POST'])
def rota_cadastro():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')

        if not nome or not email or not senha:
            flash('Todos os campos são obrigatórios!', 'danger')
            return redirect(url_for('auth.rota_cadastro'))

        usuario_existente = Usuario.query.filter_by(email=email).first()
        if usuario_existente:
            flash('Este e-mail já está em uso. Por favor, escolha outro.', 'danger')
            return redirect(url_for('auth.rota_cadastro'))

        novo_usuario = Usuario(nome=nome, email=email)
        novo_usuario.set_senha(senha)
        db.session.add(novo_usuario)
        db.session.commit()

        flash('Conta criada com sucesso! Por favor, faça o login.', 'success')
        return redirect(url_for('auth.rota_login'))
    return render_template('cadastro.html')

@bp.route('/login/google')
def login_google():
    redirect_uri = url_for('auth.authorize_google', _external=True)
    flash('Login com Google em desenvolvimento', 'info')
    return redirect(url_for('auth.rota_login'))

@bp.route('/login/google/callback')
def authorize_google():
    flash('Login com Google em desenvolvimento', 'info')
    return redirect(url_for('auth.rota_login'))

@bp.route('/esqueceu_senha')
def rota_esqueceu_senha():
    return render_template('esqueceu_senha.html')

@bp.route('/codigo')
def rota_codigo():
    return render_template('codigo.html')

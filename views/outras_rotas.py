from flask import Blueprint, render_template

bp = Blueprint('outras_rotas', __name__)

@bp.route('/calendario')
def rota_calendario():
    return render_template('calendario.html')

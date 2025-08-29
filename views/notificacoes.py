from flask import Blueprint, session, jsonify
from ..models import Usuario, Notificacao
from ..extensions import db

bp = Blueprint('notificacoes', __name__)


@bp.route('/api/notificacoes', methods=['GET'])
def api_get_notificacoes():
    """Retorna todas as notificações do usuário logado"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        notificacoes = Notificacao.query.filter_by(usuario_id=session['user_id']).order_by(Notificacao.data_criacao.desc()).all()
        
        notificacoes_json = [{
            "id": n.id,
            "titulo": n.titulo,
            "mensagem": n.mensagem,
            "tipo": n.tipo.name,
            "lida": n.lida,
            "data_criacao": n.data_criacao.isoformat() if n.data_criacao else None
        } for n in notificacoes]
        
        return jsonify(notificacoes_json)

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar notificações: {str(e)}"}), 500

@bp.route('/api/notificacoes/<int:notificacao_id>/marcar-lida', methods=['PUT'])
def api_marcar_notificacao_lida(notificacao_id):
    """Marca uma notificação como lida"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        notificacao = Notificacao.query.filter_by(
            id=notificacao_id, 
            usuario_id=session['user_id']
        ).first()

        if not notificacao:
            return jsonify({"error": "Notificação não encontrada"}), 404

        notificacao.lida = True
        db.session.commit()

        return jsonify({"message": "Notificação marcada como lida!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao marcar notificação: {str(e)}"}), 500

@bp.route('/api/notificacoes/marcar-todas-lidas', methods=['PUT'])
def api_marcar_todas_notificacoes_lidas():
    """Marca todas as notificações do usuário como lidas"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        Notificacao.query.filter_by(usuario_id=session['user_id'], lida=False).update({"lida": True})
        db.session.commit()

        return jsonify({"message": "Todas as notificações foram marcadas como lidas!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao marcar notificações: {str(e)}"}), 500

@bp.route('/api/notificacoes/contador', methods=['GET'])
def api_get_contador_notificacoes():
    """Retorna o contador de notificações não lidas"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        contador = Notificacao.query.filter_by(usuario_id=session['user_id'], lida=False).count()
        return jsonify({"contador": contador})

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar contador: {str(e)}"}), 500

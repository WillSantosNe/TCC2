from flask import Blueprint, request, session, jsonify
from ..models import Usuario
from ..extensions import db
import os
import secrets

bp = Blueprint('configuracoes', __name__)

@bp.route('/api/configuracoes/trocar-senha', methods=['POST'])
def api_trocar_senha():
    """Inicia o processo de troca de senha enviando email de confirmação"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        senha_atual = request.json.get('senha_atual')
        nova_senha = request.json.get('nova_senha')
        
        if not usuario.check_senha(senha_atual):
            return jsonify({"error": "Senha atual incorreta"}), 400

        token = usuario.gerar_token_confirmacao()
        db.session.commit()
        
        return jsonify({
            "message": "Email de confirmação enviado!",
            "token": token
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao processar solicitação: {str(e)}"}), 500

@bp.route('/api/configuracoes/confirmar-senha/<token>', methods=['POST'])
def api_confirmar_senha(token):
    """Confirma a troca de senha usando o token"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        if not usuario.verificar_token(token):
            return jsonify({"error": "Token inválido ou expirado"}), 400

        nova_senha = request.json.get('nova_senha')
        if not nova_senha:
            return jsonify({"error": "Nova senha é obrigatória"}), 400

        usuario.set_senha(nova_senha)
        usuario.limpar_token()
        db.session.commit()

        return jsonify({"message": "Senha alterada com sucesso!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao alterar senha: {str(e)}"}), 500

@bp.route('/api/configuracoes/foto-perfil', methods=['POST'])
def api_foto_perfil():
    """Atualiza a foto de perfil do usuário"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        if 'foto' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400

        arquivo = request.files['foto']
        if arquivo.filename == '':
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400

        if arquivo:
            extensoes_permitidas = {'png', 'jpg', 'jpeg', 'gif'}
            if '.' not in arquivo.filename or \
               arquivo.filename.rsplit('.', 1)[1].lower() not in extensoes_permitidas:
                return jsonify({"error": "Tipo de arquivo não permitido"}), 400

            nome_arquivo = f"perfil_{session['user_id']}_{secrets.token_hex(8)}.{arquivo.filename.rsplit('.', 1)[1].lower()}"
            caminho_arquivo = os.path.join('static/uploads', nome_arquivo)
            
            arquivo.save(caminho_arquivo)

            usuario = Usuario.query.get(session['user_id'])
            if usuario.foto_perfil and os.path.exists(os.path.join('static', usuario.foto_perfil)):
                os.remove(os.path.join('static', usuario.foto_perfil))

            usuario.foto_perfil = f"uploads/{nome_arquivo}"
            db.session.commit()

            return jsonify({
                "message": "Foto atualizada com sucesso!",
                "foto_url": f"/static/{usuario.foto_perfil}"
            })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar foto: {str(e)}"}), 500

@bp.route('/api/configuracoes/notificacoes', methods=['POST'])
def api_configurar_notificacoes():
    """Atualiza as configurações de notificações"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        data = request.get_json()
        
        usuario.email_notificacoes = data.get('email_notificacoes', True)
        usuario.app_notificacoes = data.get('app_notificacoes', True)
        usuario.frequencia_notificacoes = data.get('frequencia_notificacoes', 'instant')
        
        db.session.commit()

        return jsonify({
            "message": "Configurações atualizadas com sucesso!",
            "configuracoes": {
                "email_notificacoes": usuario.email_notificacoes,
                "app_notificacoes": usuario.app_notificacoes,
                "frequencia_notificacoes": usuario.frequencia_notificacoes
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar configurações: {str(e)}"}), 500

@bp.route('/api/configuracoes/perfil', methods=['GET'])
def api_get_configuracoes():
    """Retorna as configurações atuais do usuário"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        usuario = Usuario.query.get(session['user_id'])
        if not usuario:
            return jsonify({"error": "Usuário não encontrado"}), 404

        return jsonify({
            "foto_perfil": usuario.foto_perfil,
            "email_notificacoes": usuario.email_notificacoes,
            "app_notificacoes": usuario.app_notificacoes,
            "frequencia_notificacoes": usuario.frequencia_notificacoes
        })

    except Exception as e:
        return jsonify({"error": f"Erro ao buscar configurações: {str(e)}"}), 500

from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from ..models import Usuario, Disciplina, StatusDisciplina
from ..extensions import db

bp = Blueprint('disciplinas', __name__)

def formatar_usuario_json(usuario):
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email
    }

@bp.route('/disciplinas')
def rota_disciplinas():
    if 'user_id' not in session:
        return redirect(url_for('auth.rota_login'))

    usuario = Usuario.query.get(session['user_id'])
    if not usuario:
        session.clear()
        return redirect(url_for('auth.rota_login'))

    disciplinas = Disciplina.query.filter_by(usuario_id=session['user_id']).all()
    
    disciplinas_json = [{
        "id": d.id,
        "nome": d.nome,
        "descricao": d.descricao or "",
        "professor": d.professor or "-",
        "periodo": d.periodo or "",
        "status": d.status.value
    } for d in disciplinas]

    return render_template('disciplinas.html', disciplinas=disciplinas_json, usuario=formatar_usuario_json(usuario))


@bp.route('/api/disciplinas', methods=['GET'])
def api_get_disciplinas():
    """Retorna todas as disciplinas do usuário logado"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    disciplinas = Disciplina.query.filter_by(usuario_id=session['user_id']).all()
    
    disciplinas_json = [{
        "id": d.id,
        "nome": d.nome,
        "descricao": d.descricao or "",
        "professor": d.professor or "-",
        "periodo": d.periodo or "",
        "status": d.status.value
    } for d in disciplinas]
    
    return jsonify(disciplinas_json)

@bp.route('/api/disciplinas', methods=['POST'])
def api_criar_disciplina():
    """Cria uma nova disciplina"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        data = request.get_json()
        
        if not data.get('nome'):
            return jsonify({"error": "Nome da disciplina é obrigatório"}), 400
        
        if not data.get('periodo'):
            return jsonify({"error": "Período é obrigatório"}), 400
        
        if not data.get('status'):
            return jsonify({"error": "Status é obrigatório"}), 400

        status_map = {
            "Ativa": StatusDisciplina.ATIVA,
            "Em Andamento": StatusDisciplina.ANDAMENTO,
            "Concluída": StatusDisciplina.CONCLUIDA,
            "Agendada": StatusDisciplina.ATIVA 
        }
        
        status_enum = status_map.get(data.get('status'), StatusDisciplina.ATIVA)

        nova_disciplina = Disciplina(
            nome=data.get('nome'),
            descricao=data.get('descricao', ''),
            professor=data.get('professor', ''),
            periodo=data.get('periodo'),
            status=status_enum,
            usuario_id=session['user_id']
        )

        db.session.add(nova_disciplina)
        db.session.commit()

        return jsonify({
            "id": nova_disciplina.id,
            "nome": nova_disciplina.nome,
            "descricao": nova_disciplina.descricao or "",
            "professor": nova_disciplina.professor or "-",
            "periodo": nova_disciplina.periodo or "",
            "status": nova_disciplina.status.value,
            "message": "Disciplina criada com sucesso!"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao criar disciplina: {str(e)}"}), 500

@bp.route('/api/disciplinas/<int:disciplina_id>', methods=['PUT'])
def api_atualizar_disciplina(disciplina_id):
    """Atualiza uma disciplina existente"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        disciplina = Disciplina.query.filter_by(
            id=disciplina_id, 
            usuario_id=session['user_id']
        ).first()

        if not disciplina:
            return jsonify({"error": "Disciplina não encontrada"}), 404

        data = request.get_json()
        
        if not data.get('nome'):
            return jsonify({"error": "Nome da disciplina é obrigatório"}), 400
        
        if not data.get('periodo'):
            return jsonify({"error": "Período é obrigatório"}), 400
        
        if not data.get('status'):
            return jsonify({"error": "Status é obrigatório"}), 400

        status_map = {
            "Ativa": StatusDisciplina.ATIVA,
            "Em Andamento": StatusDisciplina.ANDAMENTO,
            "Concluída": StatusDisciplina.CONCLUIDA,
            "Agendada": StatusDisciplina.ATIVA 
        }
        
        status_enum = status_map.get(data.get('status'), StatusDisciplina.ATIVA)

        disciplina.nome = data.get('nome')
        disciplina.descricao = data.get('descricao', '')
        disciplina.professor = data.get('professor', '')
        disciplina.periodo = data.get('periodo')
        disciplina.status = status_enum

        db.session.commit()

        return jsonify({
            "id": disciplina.id,
            "nome": disciplina.nome,
            "descricao": disciplina.descricao or "",
            "professor": disciplina.professor or "-",
            "periodo": disciplina.periodo or "",
            "status": disciplina.status.value,
            "message": "Disciplina atualizada com sucesso!"
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao atualizar disciplina: {str(e)}"}), 500

@bp.route('/api/disciplinas/<int:disciplina_id>', methods=['DELETE'])
def api_deletar_disciplina(disciplina_id):
    """Deleta uma disciplina"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        disciplina = Disciplina.query.filter_by(
            id=disciplina_id, 
            usuario_id=session['user_id']
        ).first()

        if not disciplina:
            return jsonify({"error": "Disciplina não encontrada"}), 404

        db.session.delete(disciplina)
        db.session.commit()

        return jsonify({"message": "Disciplina removida com sucesso!"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao remover disciplina: {str(e)}"}), 500

@bp.route('/api/disciplina/<int:disciplina_id>')
def api_get_disciplina(disciplina_id):
    """Retorna uma disciplina específica"""
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    disciplina = Disciplina.query.filter_by(id=disciplina_id, usuario_id=session['user_id']).first()

    if disciplina:
        return jsonify({
            "id": disciplina.id,
            "nome": disciplina.nome,
            "descricao": disciplina.descricao,
            "professor": disciplina.professor,
            "periodo": disciplina.periodo,
            "status": disciplina.status.value 
        })
    else:
        return jsonify({"error": "Disciplina não encontrada"}), 404

from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from ..models import Usuario, Disciplina, Tarefa, Anotacao, TipoNotificacao
from ..extensions import db

bp = Blueprint('anotacoes', __name__)

bp = Blueprint('anotacoes', __name__)

def formatar_usuario_json(usuario):
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email
    }

@bp.route('/anotacao')
def rota_anotacao():
    if 'user_id' not in session:
        return redirect(url_for('auth.rota_login'))

    usuario = Usuario.query.get(session['user_id'])
    
    disciplinas = Disciplina.query.filter_by(usuario_id=session['user_id']).all()
    
    ids_disciplinas_usuario = [d.id for d in disciplinas]
    tarefas = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).all()
    anotacoes = Anotacao.query.join(Disciplina).filter(Disciplina.usuario_id == session['user_id']).order_by(Anotacao.data_criacao.desc()).all()

    disciplinas_json = [{"id": d.id, "nome": d.nome} for d in disciplinas]
    tarefas_json = [{"id": t.id, "titulo": t.titulo, "disciplinaId": t.disciplina_id} for t in tarefas]
    anotacoes_json = [{
        "id": a.id, "titulo": a.titulo, "disciplinaId": a.disciplina_id,
        "atividadeVinculadaId": a.tarefa_id, "conteudo": a.conteudo,
        "dataCriacao": a.data_criacao.isoformat(),
        "ultimaModificacao": a.data_criacao.isoformat()
    } for a in anotacoes]

    return render_template(
        'anotacao.html', 
        usuario=formatar_usuario_json(usuario),
        initial_anotacoes=anotacoes_json,
        initial_disciplinas=disciplinas_json,
        initial_tarefas=tarefas_json
    )

@bp.route('/anotacoes/criar', methods=['POST'])
def criar_anotacao():
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Não autorizado'}), 401

    try:
        titulo = request.form.get('principalAnotacaoTitulo')
        conteudo = request.form.get('principalAnotacaoConteudo')
        disciplina_id = request.form.get('principalAnotacaoDisciplina')
        tarefa_id = request.form.get('principalAnotacaoAtividade')

        if not titulo:
            flash('O título é obrigatório.', 'danger')
            return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

        disciplina_id = int(disciplina_id) if disciplina_id else None
        tarefa_id = int(tarefa_id) if tarefa_id else None

        if disciplina_id:
            disciplina = Disciplina.query.filter_by(
                id=disciplina_id, 
                usuario_id=session['user_id']
            ).first()
            if not disciplina:
                flash('Disciplina inválida.', 'danger')
                return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

        if tarefa_id:
            tarefa = Tarefa.query.join(Disciplina).filter(
                Tarefa.id == tarefa_id,
                Disciplina.usuario_id == session['user_id']
            ).first()
            if not tarefa:
                flash('Tarefa inválida.', 'danger')
                return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

        nova_anotacao = Anotacao(
            titulo=titulo,
            conteudo=conteudo,
            usuario_id=session['user_id'],
            disciplina_id=disciplina_id,
            tarefa_id=tarefa_id
        )

        db.session.add(nova_anotacao)
        db.session.commit()

        usuario = Usuario.query.get(session['user_id'])
        usuario.criar_notificacao(
            titulo="Anotação Criada",
            mensagem=f"Anotação '{titulo}' foi criada com sucesso!",
            tipo=TipoNotificacao.SISTEMA
        )
        db.session.commit()

        flash('Anotação criada com sucesso!', 'success')
        return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

    except Exception as e:
        db.session.rollback()
        flash(f'Erro ao criar anotação: {str(e)}', 'danger')
        return redirect(request.referrer or url_for('dashboard.rota_dashboard'))


@bp.route('/api/anotacoes/<int:anotacao_id>', methods=['POST'])
def api_atualizar_anotacao(anotacao_id):
    """Atualiza uma anotação existente."""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Não autorizado'}), 401
    
    try:
        anotacao = db.session.query(Anotacao).join(Disciplina).filter(
            Anotacao.id == anotacao_id,
            Disciplina.usuario_id == session['user_id']
        ).first()

        if not anotacao:
            return jsonify({'success': False, 'error': 'Anotação não encontrada'}), 404

        anotacao.titulo = request.form.get('principalAnotacaoTitulo')
        anotacao.conteudo = request.form.get('principalAnotacaoConteudo')
        
        disciplina_id = request.form.get('principalAnotacaoDisciplina')
        anotacao.disciplina_id = int(disciplina_id) if disciplina_id else None
        
        tarefa_id = request.form.get('principalAnotacaoAtividade')
        anotacao.tarefa_id = int(tarefa_id) if tarefa_id else None

        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Anotação atualizada com sucesso!',
            'anotacao': {
                'id': anotacao.id,
                'titulo': anotacao.titulo,
                'disciplinaId': anotacao.disciplina_id,
                'atividadeVinculadaId': anotacao.tarefa_id,
                'conteudo': anotacao.conteudo,
                'dataCriacao': anotacao.data_criacao.isoformat(),
                'ultimaModificacao': anotacao.data_modificacao.isoformat()
            }
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@bp.route('/api/anotacoes/<int:anotacao_id>', methods=['DELETE'])
def api_deletar_anotacao(anotacao_id):
    """Deleta uma anotação."""
    if 'user_id' not in session:
        return jsonify({'success': False, 'error': 'Não autorizado'}), 401
    
    try:
        anotacao = db.session.query(Anotacao).join(Disciplina).filter(
            Anotacao.id == anotacao_id,
            Disciplina.usuario_id == session['user_id']
        ).first()

        if not anotacao:
            return jsonify({'success': False, 'error': 'Anotação não encontrada'}), 404

        db.session.delete(anotacao)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Anotação removida com sucesso!'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

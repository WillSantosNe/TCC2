from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from ..models import Usuario, Disciplina, Tarefa, StatusTarefa, TipoTarefa
from ..extensions import db
from datetime import date, datetime

bp = Blueprint('tarefas', __name__)

def formatar_usuario_json(usuario):
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email
    }

@bp.route('/tarefas')
def rota_tarefas():
    if 'user_id' not in session:
        return redirect(url_for('auth.rota_login'))

    usuario = Usuario.query.get(session['user_id'])
    if not usuario:
        session.clear()
        return redirect(url_for('auth.rota_login'))

    ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
    tarefas_do_usuario = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).order_by(Tarefa.data_entrega).all()

    disciplina_id_filtro = request.args.get('disciplina_id', type=int)
    if disciplina_id_filtro:
        if disciplina_id_filtro in ids_disciplinas_usuario:
            tarefas_do_usuario = [t for t in tarefas_do_usuario if t.disciplina_id == disciplina_id_filtro]
        else:
            disciplina_id_filtro = None

    hoje = date.today()
    for tarefa in tarefas_do_usuario:
        if tarefa.data_entrega < hoje and tarefa.status != StatusTarefa.CONCLUIDA:
            tarefa.status = StatusTarefa.ATRASADA

    prioridade_status = {
        StatusTarefa.ATRASADA: 0,
        StatusTarefa.ANDAMENTO: 1,
        StatusTarefa.A_FAZER: 2,
        StatusTarefa.CONCLUIDA: 3
    }
    tarefas_ordenadas = sorted(
        tarefas_do_usuario, 
        key=lambda x: (prioridade_status.get(x.status, 99), x.data_entrega)
    )

    tarefas_para_json = [{
        "id": t.id, "titulo": t.titulo, "descricao": t.descricao,
        "data_entrega": t.data_entrega.isoformat(),
        "status": t.status.name, "tipo": t.tipo.name,
        "disciplina": {"id": t.disciplina.id, "nome": t.disciplina.nome}
    } for t in tarefas_ordenadas]

    disciplinas_para_json = [{"id": d.id, "nome": d.nome} for d in usuario.disciplinas]

    return render_template('tarefas.html', 
                        tarefas=tarefas_para_json, 
                        disciplinas=disciplinas_para_json,
                        usuario=formatar_usuario_json(usuario),
                        disciplina_filtro_id=disciplina_id_filtro)

@bp.route('/tarefas/criar', methods=['POST'])
def criar_tarefa():
    if 'user_id' not in session:
        flash('Você precisa estar logado para criar uma tarefa.', 'warning')
        return redirect(url_for('auth.rota_login'))

    titulo = request.form.get('principalTarefaTituloQuickAdd')
    disciplina_id = request.form.get('principalTarefaDisciplinaQuickAdd')
    data_str = request.form.get('principalTarefaDataEntregaQuickAdd')
    tipo_str = request.form.get('principalTarefaTipoQuickAdd')
    status_str = request.form.get('principalTarefaStatusQuickAdd')
    descricao = request.form.get('principalTarefaDescricaoQuickAdd')

    if not all([titulo, disciplina_id, data_str, tipo_str, status_str]):
        flash('Todos os campos obrigatórios devem ser preenchidos.', 'danger')
        return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

    data_entrega = datetime.strptime(data_str, '%Y-%m-%d').date()
    tipo_enum = TipoTarefa[tipo_str.upper()]

    status_map = {
        "A_FAZER": StatusTarefa.A_FAZER,
        "ANDAMENTO": StatusTarefa.ANDAMENTO,
        "CONCLUIDA": StatusTarefa.CONCLUIDA
    }
    status_enum = status_map.get(status_str.upper())

    if status_enum is None:
        flash(f"Status inválido recebido: {status_str}", 'danger')
        return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

    nova_tarefa = Tarefa(
        titulo=titulo,
        descricao=descricao,
        data_entrega=data_entrega,
        tipo=tipo_enum,
        status=status_enum,
        disciplina_id=int(disciplina_id)
    )

    db.session.add(nova_tarefa)
    db.session.commit()

    return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

@bp.route('/api/atividade/<int:atividade_id>')
def api_get_atividade(atividade_id):
    if 'user_id' not in session:
        return jsonify({"error": "Não autorizado"}), 401

    atividade = db.session.query(Tarefa).join(Disciplina).filter(
        Tarefa.id == atividade_id,
        Disciplina.usuario_id == session['user_id']
    ).first()

    if atividade:
        return jsonify({
            "id": atividade.id,
            "titulo": atividade.titulo,
            "descricao": atividade.descricao,
            "data_entrega": atividade.data_entrega.isoformat(),
            "status": atividade.status.name,
            "tipo": atividade.tipo.name,
            "disciplina_id": atividade.disciplina.id,
            "disciplina_nome": atividade.disciplina.nome
        })
    else:
        return jsonify({"error": "Atividade não encontrada"}), 404

@bp.route('/tarefas/atualizar/<int:tarefa_id>', methods=['POST'])
def atualizar_tarefa(tarefa_id):
    if 'user_id' not in session:
        flash('Você precisa estar logado para editar uma tarefa.', 'warning')
        return redirect(url_for('auth.rota_login'))

    tarefa = db.session.query(Tarefa).join(Disciplina).filter(
        Tarefa.id == tarefa_id,
        Disciplina.usuario_id == session['user_id']
    ).first_or_404()

    tarefa.titulo = request.form.get('principalTarefaTituloQuickAdd')
    tarefa.disciplina_id = int(request.form.get('principalTarefaDisciplinaQuickAdd'))
    tarefa.data_entrega = datetime.strptime(request.form.get('principalTarefaDataEntregaQuickAdd'), '%Y-%m-%d').date()
    tarefa.tipo = TipoTarefa[request.form.get('principalTarefaTipoQuickAdd').upper()]
    tarefa.descricao = request.form.get('principalTarefaDescricaoQuickAdd')

    status_map = {
        "A_FAZER": StatusTarefa.A_FAZER,
        "ANDAMENTO": StatusTarefa.ANDAMENTO,
        "CONCLUIDA": StatusTarefa.CONCLUIDA
    }
    tarefa.status = status_map.get(request.form.get('principalTarefaStatusQuickAdd').upper(), tarefa.status)
    
    db.session.commit()
    return redirect(url_for('tarefas.rota_tarefas'))

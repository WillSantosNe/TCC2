from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from ..models import Usuario, Disciplina, Tarefa, StatusTarefa, StatusDisciplina
from ..extensions import db
from datetime import date

bp = Blueprint('dashboard', __name__)

def formatar_usuario_json(usuario):
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email
    }

@bp.route('/dashboard')
def rota_dashboard():
    if 'user_id' not in session:
        return redirect(url_for('auth.rota_login'))

    usuario = Usuario.query.get(session['user_id'])
    if not usuario:
        session.clear()
        return redirect(url_for('auth.rota_login'))

    ids_disciplinas_usuario = [d.id for d in usuario.disciplinas]
    atividades = Tarefa.query.filter(Tarefa.disciplina_id.in_(ids_disciplinas_usuario)).all()

    hoje = date.today()
    for atividade in atividades:
        if atividade.data_entrega < hoje and atividade.status != StatusTarefa.CONCLUIDA:
            atividade.status = StatusTarefa.ATRASADA
            
    prioridade_status = {
        StatusTarefa.ATRASADA: 0,
        StatusTarefa.ANDAMENTO: 1,
        StatusTarefa.A_FAZER: 2,
        StatusTarefa.CONCLUIDA: 3
    }
    atividades_ordenadas = sorted(
        atividades, 
        key=lambda x: (prioridade_status.get(x.status, 99), x.data_entrega)
    )
    
    tarefas_dashboard = [t for t in atividades_ordenadas if t.tipo.name == 'TAREFA'][:4]
    provas_dashboard = [p for p in atividades_ordenadas if p.tipo.name == 'PROVA'][:4]

    todas_tarefas_json = [{
        "id": t.id, "titulo": t.titulo,
        "disciplina": {"id": t.disciplina.id, "nome": t.disciplina.nome}
    } for t in atividades]

    disciplinas_json = [{"id": d.id, "nome": d.nome} for d in usuario.disciplinas]

    return render_template(
        'principal.html', 
        usuario=formatar_usuario_json(usuario), 
        disciplinas=disciplinas_json,
        tarefas_dashboard=tarefas_dashboard,
        provas_dashboard=provas_dashboard,
        todas_tarefas_json=todas_tarefas_json,
        disciplinas_json=disciplinas_json
    )

@bp.route('/disciplinas/criar', methods=['POST'])
def criar_disciplina():
    if 'user_id' not in session:
        flash('Você precisa estar logado para criar uma disciplina.', 'warning')
        return redirect(url_for('auth.rota_login'))

    nome = request.form.get('principalDisciplinaNome')
    professor = request.form.get('principalDisciplinaProfessor')
    periodo = request.form.get('principalDisciplinaPeriodo')
    status_str = request.form.get('principalDisciplinaStatus')

    status_map = {
        "Ativa": StatusDisciplina.ATIVA,
        "Em Andamento": StatusDisciplina.ANDAMENTO,
        "Concluída": StatusDisciplina.CONCLUIDA
    }
    status_enum = status_map.get(status_str, StatusDisciplina.ATIVA)

    nova_disciplina = Disciplina(
        nome=nome,
        professor=professor,
        periodo=periodo,
        status=status_enum,
        usuario_id=session['user_id']
    )

    db.session.add(nova_disciplina)
    db.session.commit()

    return redirect(request.referrer or url_for('dashboard.rota_dashboard'))

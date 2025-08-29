"""Adiciona coluna usuario_id em Anotacao

Revision ID: f6c3b020a877
Revises: 79187cbe9d9f
Create Date: 2025-08-29 13:34:11.689796

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision = 'f6c3b020a877'
down_revision = '79187cbe9d9f'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('token_confirmacao', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('token'))

    op.drop_table('token_confirmacao')
    
    with op.batch_alter_table('notificacao', schema=None) as batch_op:
        batch_op.alter_column('mensagem',
               existing_type=mysql.TEXT(),
               nullable=False)
        batch_op.alter_column('tipo',
               existing_type=mysql.ENUM('TAREFA_PRAZO', 'PROVA_PRAZO', 'SISTEMA', 'DISCIPLINA'),
               type_=sa.Enum('TAREFA', 'PROVA', 'DISCIPLINA', 'SISTEMA', name='tiponotificacao'),
               existing_nullable=False)
        batch_op.alter_column('lida',
               existing_type=mysql.TINYINT(display_width=1),
               nullable=False)
        batch_op.drop_constraint('notificacao_ibfk_3', type_='foreignkey')
        batch_op.drop_constraint('notificacao_ibfk_2', type_='foreignkey')
        batch_op.drop_column('tarefa_id')
        batch_op.drop_column('disciplina_id')
        batch_op.drop_column('data_leitura')
    op.add_column('anotacao', sa.Column('usuario_id', sa.Integer(), nullable=True))
    op.execute('UPDATE anotacao SET usuario_id = 1 WHERE usuario_id IS NULL')

    with op.batch_alter_table('anotacao', schema=None) as batch_op:
        batch_op.alter_column('usuario_id',
               existing_type=sa.Integer(),
               nullable=False)
        batch_op.create_foreign_key(
            'fk_anotacao_usuario_id',
            'usuario', 
            ['usuario_id'], 
            ['id']
        )

def downgrade():
    with op.batch_alter_table('anotacao', schema=None) as batch_op:
        batch_op.drop_constraint('fk_anotacao_usuario_id', type_='foreignkey')
        batch_op.drop_column('usuario_id')

    with op.batch_alter_table('notificacao', schema=None) as batch_op:
        batch_op.add_column(sa.Column('data_leitura', mysql.DATETIME(), nullable=True))
        batch_op.add_column(sa.Column('disciplina_id', mysql.INTEGER(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column('tarefa_id', mysql.INTEGER(), autoincrement=False, nullable=True))
        batch_op.create_foreign_key('notificacao_ibfk_2', 'disciplina', ['disciplina_id'], ['id'])
        batch_op.create_foreign_key('notificacao_ibfk_3', 'tarefa', ['tarefa_id'], ['id'])
        batch_op.alter_column('lida',
               existing_type=mysql.TINYINT(display_width=1),
               nullable=True)
        batch_op.alter_column('tipo',
               existing_type=sa.Enum('TAREFA', 'PROVA', 'DISCIPLINA', 'SISTEMA', name='tiponotificacao'),
               type_=mysql.ENUM('TAREFA_PRAZO', 'PROVA_PRAZO', 'SISTEMA', 'DISCIPLINA'),
               existing_nullable=False)
        batch_op.alter_column('mensagem',
               existing_type=mysql.TEXT(),
               nullable=True)

    op.create_table('token_confirmacao',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('token', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('usuario_id', mysql.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('tipo', mysql.VARCHAR(length=50), nullable=False),
    sa.Column('expira_em', mysql.DATETIME(), nullable=False),
    sa.Column('usado', mysql.TINYINT(display_width=1), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['usuario_id'], ['usuario.id'], name=op.f('token_confirmacao_ibfk_1')),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    with op.batch_alter_table('token_confirmacao', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('token'), ['token'], unique=True)


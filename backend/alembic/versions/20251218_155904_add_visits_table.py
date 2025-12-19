"""add visits table

Revision ID: 20251218_155904
Revises: 
Create Date: 2025-12-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '20251218_155904'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'visits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('property_id', sa.Integer(), nullable=False),
        sa.Column('lead_id', sa.Integer(), nullable=True),
        sa.Column('agent_id', sa.Integer(), nullable=False),
        sa.Column('scheduled_date', sa.DateTime(), nullable=False),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('checked_in_at', sa.DateTime(), nullable=True),
        sa.Column('checked_out_at', sa.DateTime(), nullable=True),
        sa.Column('checkin_latitude', sa.Float(), nullable=True),
        sa.Column('checkin_longitude', sa.Float(), nullable=True),
        sa.Column('checkin_accuracy_meters', sa.Float(), nullable=True),
        sa.Column('distance_from_property_meters', sa.Float(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('interest_level', sa.String(), nullable=True),
        sa.Column('feedback_notes', sa.Text(), nullable=True),
        sa.Column('will_return', sa.Boolean(), nullable=True),
        sa.Column('next_steps', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.Column('reminder_sent', sa.Boolean(), nullable=True),
        sa.Column('confirmation_sent', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.ForeignKeyConstraint(['agent_id'], ['agents.id'], ),
    )
    op.create_index(op.f('ix_visits_id'), 'visits', ['id'], unique=False)
    op.create_index(op.f('ix_visits_property_id'), 'visits', ['property_id'], unique=False)
    op.create_index(op.f('ix_visits_lead_id'), 'visits', ['lead_id'], unique=False)
    op.create_index(op.f('ix_visits_agent_id'), 'visits', ['agent_id'], unique=False)
    op.create_index(op.f('ix_visits_scheduled_date'), 'visits', ['scheduled_date'], unique=False)
    op.create_index(op.f('ix_visits_status'), 'visits', ['status'], unique=False)
    op.create_index(op.f('ix_visits_created_at'), 'visits', ['created_at'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_visits_created_at'), table_name='visits')
    op.drop_index(op.f('ix_visits_status'), table_name='visits')
    op.drop_index(op.f('ix_visits_scheduled_date'), table_name='visits')
    op.drop_index(op.f('ix_visits_agent_id'), table_name='visits')
    op.drop_index(op.f('ix_visits_lead_id'), table_name='visits')
    op.drop_index(op.f('ix_visits_property_id'), table_name='visits')
    op.drop_index(op.f('ix_visits_id'), table_name='visits')
    op.drop_table('visits')

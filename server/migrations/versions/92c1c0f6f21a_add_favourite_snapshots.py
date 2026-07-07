"""Add favourite game snapshots

Revision ID: 92c1c0f6f21a
Revises: ca3bc9e47924
Create Date: 2026-07-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "92c1c0f6f21a"
down_revision = "ca3bc9e47924"
branch_labels = None
depends_on = None


def upgrade():
    # Store enough display data for Favorites without requiring a second RAWG fetch.
    with op.batch_alter_table("favourites") as batch_op:
        batch_op.add_column(sa.Column("game_name", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("background_image", sa.String(length=500), nullable=True))
        batch_op.add_column(sa.Column("rating", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("released", sa.String(length=32), nullable=True))
        batch_op.create_unique_constraint(
            "uq_favourites_user_game",
            ["user_id", "game_id"],
        )


def downgrade():
    # Reverse the snapshot columns and uniqueness constraint if this migration is rolled back.
    with op.batch_alter_table("favourites") as batch_op:
        batch_op.drop_constraint("uq_favourites_user_game", type_="unique")
        batch_op.drop_column("released")
        batch_op.drop_column("rating")
        batch_op.drop_column("background_image")
        batch_op.drop_column("game_name")

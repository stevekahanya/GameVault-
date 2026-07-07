"""Collection model for grouping games under the authenticated user."""

from datetime import datetime

from app.extensions import db


class Collection(db.Model):
    """User-owned named collection with optional game entries."""
    __tablename__ = "collections"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    description = db.Column(db.Text)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    user = db.relationship(
        "User",
        back_populates="collections"
    )

    games = db.relationship(
        "CollectionGame",
        back_populates="collection",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        """Serialize collection details with included game ids."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id,
            "games": [game.to_dict() for game in self.games],
        }

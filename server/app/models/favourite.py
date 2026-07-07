"""Favourite model storing user-owned saved games and display snapshots."""

from datetime import datetime

from app.extensions import db


class Favourite(db.Model):
    """A saved game for one user, unique by user and RAWG game id."""
    __tablename__ = "favourites"
    __table_args__ = (
        db.UniqueConstraint("user_id", "game_id", name="uq_favourites_user_game"),
    )

    id = db.Column(db.Integer, primary_key=True)

    game_id = db.Column(db.Integer, nullable=False)
    game_name = db.Column(db.String(255))
    background_image = db.Column(db.String(500))
    rating = db.Column(db.Float)
    released = db.Column(db.String(32))

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
        back_populates="favourites"
    )

    def to_dict(self):
        """Nest game snapshot data so React can reuse the same GameCard component."""
        return {
            "id": self.id,
            "game_id": self.game_id,
            "game": {
                "id": self.game_id,
                "name": self.game_name or f"Game #{self.game_id}",
                "background_image": self.background_image,
                "rating": self.rating,
                "released": self.released,
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id,
        }

"""Review model for user-owned game feedback."""

from datetime import datetime

from app.extensions import db


class Review(db.Model):
    """A rating and comment tied to both a RAWG game and a QuestLog user."""
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    user = db.relationship("User", back_populates="reviews")

    def to_dict(self):
        """Serialize with username fields expected by the React review list."""
        username = self.user.username if self.user else "Deleted user"
        return {
            "id": self.id,
            "game_id": self.game_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "date": self.created_at.isoformat() if self.created_at else None,
            "user_id": self.user_id,
            "username": username,
            "user": username,
        }

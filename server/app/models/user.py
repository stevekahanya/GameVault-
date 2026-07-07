"""User model with password hashing and owned-resource relationships."""

from datetime import datetime

from app.extensions import db, bcrypt


class User(db.Model):
    """Authenticated QuestLog account."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    favourites = db.relationship(
        "Favourite",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reviews = db.relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    collections = db.relationship(
        "Collection",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def set_password(self, password):
        """Hash a raw password before storage."""
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        """Compare a login password with the stored bcrypt hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Return only safe profile fields for API responses."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<User {self.username}>"

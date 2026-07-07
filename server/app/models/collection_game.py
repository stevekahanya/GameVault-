"""Join model connecting a collection to RAWG game ids."""

from app.extensions import db


class CollectionGame(db.Model):
    """A single game entry inside a user-owned collection."""
    __tablename__ = "collection_games"

    id = db.Column(db.Integer, primary_key=True)

    game_id = db.Column(db.Integer, nullable=False)

    collection_id = db.Column(
        db.Integer,
        db.ForeignKey("collections.id"),
        nullable=False
    )

    collection = db.relationship(
        "Collection",
        back_populates="games"
    )

    def to_dict(self):
        """Serialize the collection membership row for API responses."""
        return {
            "id": self.id,
            "game_id": self.game_id,
            "collection_id": self.collection_id,
        }

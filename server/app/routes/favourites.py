"""Favourite routes for saving and removing games owned by the current user."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.favourite import Favourite

favourites_bp = Blueprint("favourites", __name__, url_prefix="/api/favourites")


@favourites_bp.route("/", methods=["GET"])
@jwt_required()
def get_favourites():
    """Return saved game snapshots for the authenticated user."""
    favourites = (
        Favourite.query.filter_by(user_id=int(get_jwt_identity()))
        .order_by(Favourite.created_at.desc())
        .all()
    )

    return jsonify([favourite.to_dict() for favourite in favourites]), 200


@favourites_bp.route("/", methods=["POST"])
@jwt_required()
def add_favourite():
    """Create or refresh a favourite using game display data from the client."""
    data = request.get_json(silent=True) or {}
    game = data.get("game") or {}

    try:
        game_id = int(data.get("game_id") or game.get("id"))
    except (TypeError, ValueError):
        return jsonify({"error": "A valid game_id is required."}), 400

    user_id = int(get_jwt_identity())
    favourite = Favourite.query.filter_by(
        user_id=user_id,
        game_id=game_id,
    ).first()

    status_code = 200

    if not favourite:
        favourite = Favourite(user_id=user_id, game_id=game_id)
        db.session.add(favourite)
        status_code = 201

    # Store a snapshot so the Favorites page can render without another RAWG request.
    favourite.game_name = data.get("game_name") or game.get("name")
    favourite.background_image = data.get("background_image") or game.get("background_image")
    favourite.rating = data.get("rating") or game.get("rating")
    favourite.released = data.get("released") or game.get("released")

    db.session.commit()

    return jsonify(favourite.to_dict()), status_code


@favourites_bp.route("/<int:game_id>", methods=["DELETE"])
@jwt_required()
def remove_favourite(game_id):
    """Delete only the current user's saved copy of a game."""
    favourite = Favourite.query.filter_by(
        user_id=int(get_jwt_identity()),
        game_id=game_id,
    ).first()

    if not favourite:
        return jsonify({"error": "Favourite not found."}), 404

    db.session.delete(favourite)
    db.session.commit()

    return jsonify({
        "message": "Favourite removed successfully."
    }), 200

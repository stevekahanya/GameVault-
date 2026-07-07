"""Collection CRUD routes with owner-only authorization."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models.collection import Collection
from app.models.collection_game import CollectionGame

collections_bp = Blueprint("collections", __name__, url_prefix="/api/collections")


def current_user_id():
    """Read the authenticated user id from the JWT identity."""
    return int(get_jwt_identity())


def find_owned_collection(collection_id):
    """Fetch a collection and reject access when it belongs to another user."""
    collection = db.session.get(Collection, collection_id)

    if not collection:
        return None, (jsonify({"error": "Collection not found."}), 404)

    if collection.user_id != current_user_id():
        return None, (jsonify({"error": "You can only access your own collections."}), 403)

    return collection, None


@collections_bp.route("/", methods=["GET"])
@jwt_required()
def get_collections():
    """List only the current user's collections."""
    collections = (
        Collection.query.filter_by(user_id=current_user_id())
        .order_by(Collection.created_at.desc())
        .all()
    )

    return jsonify([collection.to_dict() for collection in collections]), 200


@collections_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_collection(id):
    collection, error = find_owned_collection(id)

    if error:
        return error

    return jsonify(collection.to_dict()), 200


@collections_bp.route("/", methods=["POST"])
@jwt_required()
def create_collection():
    """Create a new collection owned by the authenticated user."""
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"error": "Collection name is required."}), 400

    collection = Collection(
        name=name,
        description=data.get("description"),
        user_id=current_user_id(),
    )

    db.session.add(collection)
    db.session.commit()

    return jsonify(collection.to_dict()), 201


@collections_bp.route("/<int:id>", methods=["PATCH"])
@jwt_required()
def update_collection(id):
    """Update collection fields after verifying ownership."""
    collection, error = find_owned_collection(id)

    if error:
        return error

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = data.get("name", "").strip()
        if not name:
            return jsonify({"error": "Collection name cannot be blank."}), 400
        collection.name = name

    if "description" in data:
        collection.description = data.get("description")

    db.session.commit()

    return jsonify(collection.to_dict()), 200


@collections_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_collection(id):
    collection, error = find_owned_collection(id)

    if error:
        return error

    db.session.delete(collection)
    db.session.commit()

    return jsonify({
        "message": "Collection deleted successfully."
    }), 200


@collections_bp.route("/<int:id>/games", methods=["POST"])
@jwt_required()
def add_game_to_collection(id):
    """Attach a RAWG game id to an owned collection without duplicating it."""
    collection, error = find_owned_collection(id)

    if error:
        return error

    data = request.get_json(silent=True) or {}

    try:
        game_id = int(data.get("game_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "A valid game_id is required."}), 400

    existing_game = CollectionGame.query.filter_by(
        collection_id=collection.id,
        game_id=game_id,
    ).first()

    if existing_game:
        return jsonify(existing_game.to_dict()), 200

    collection_game = CollectionGame(
        collection_id=collection.id,
        game_id=game_id,
    )

    db.session.add(collection_game)
    db.session.commit()

    return jsonify(collection_game.to_dict()), 201


@collections_bp.route("/<int:id>/games/<int:game_id>", methods=["DELETE"])
@jwt_required()
def remove_game_from_collection(id, game_id):
    collection, error = find_owned_collection(id)

    if error:
        return error

    collection_game = CollectionGame.query.filter_by(
        collection_id=collection.id,
        game_id=game_id,
    ).first()

    if not collection_game:
        return jsonify({"error": "Game is not in this collection."}), 404

    db.session.delete(collection_game)
    db.session.commit()

    return jsonify({"message": "Game removed from collection."}), 200

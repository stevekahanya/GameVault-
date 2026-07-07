"""User routes that expose safe account details for authenticated requests."""

from flask import Blueprint, jsonify

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from app.models import User

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Return the current user based on the JWT subject."""

    current_user_id = int(get_jwt_identity())

    user = User.query.get(current_user_id)

    if not user:
        return jsonify({
            "error": "User not found."
        }), 404

    return jsonify({"user": user.to_dict()}), 200

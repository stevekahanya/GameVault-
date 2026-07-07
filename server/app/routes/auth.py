"""Authentication routes for registration, login, and current-user lookup."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import func, or_

from app.extensions import db
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def build_auth_response(user, status_code=200, message="Authenticated successfully."):
    """Return the same token/user shape after both signup and login."""
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "message": message,
        "user": user.to_dict(),
        "access_token": access_token,
    }), status_code


@auth_bp.route("/register", methods=["POST"])
def register():
    """Create a user with a hashed password and issue the first JWT."""
    data = request.get_json(silent=True) or {}

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    # Case-insensitive uniqueness prevents duplicate accounts with email casing changes.
    existing_user = User.query.filter(
        or_(
            func.lower(User.username) == username.lower(),
            func.lower(User.email) == email,
        )
    ).first()

    if existing_user:
        return jsonify({"error": "Username or email already exists."}), 409

    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return build_auth_response(user, 201, "Account created successfully.")


@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate by username or email and issue a fresh JWT."""
    data = request.get_json(silent=True) or {}

    identifier = (
        data.get("identifier")
        or data.get("email")
        or data.get("username")
        or ""
    ).strip()
    password = data.get("password", "")

    if not identifier or not password:
        return jsonify({"error": "Email or username and password are required."}), 400

    user = User.query.filter(
        or_(
            func.lower(User.email) == identifier.lower(),
            func.lower(User.username) == identifier.lower(),
        )
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials."}), 401

    return build_auth_response(user, 200, "Login successful.")


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Return the safe profile for the JWT subject."""
    current_user_id = int(get_jwt_identity())
    user = db.session.get(User, current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200

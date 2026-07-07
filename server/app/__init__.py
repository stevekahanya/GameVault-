"""Application factory for the QuestLog Flask API."""

from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.extensions import db, bcrypt, jwt, migrate


def create_app(config_class=Config):
    """Create the API app, initialize extensions, and register namespaced routes."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Restrict browser access to the configured React origins while keeping /api namespaced.
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
    )

    from app.models import (
        Collection,
        CollectionGame,
        Favourite,
        Review,
        User,
    )

    # Blueprints keep auth, games, and user-owned resources separated by concern.
    from app.routes.auth import auth_bp
    from app.routes.collections import collections_bp
    from app.routes.favourites import favourites_bp
    from app.routes.games import games_bp
    from app.routes.reviews import reviews_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(collections_bp)
    app.register_blueprint(favourites_bp)
    app.register_blueprint(games_bp)
    app.register_blueprint(reviews_bp)
    app.register_blueprint(users_bp)

    @app.route("/")
    def home():
        return jsonify({"message": "Welcome to the QuestLog API."}), 200

    @app.route("/api/health")
    def health_check():
        return jsonify({"status": "ok"}), 200

    # Return JSON errors for JWT failures so React can display useful auth messages.
    @jwt.unauthorized_loader
    def handle_missing_token(reason):
        return jsonify({"error": "Authentication is required.", "detail": reason}), 401

    @jwt.invalid_token_loader
    def handle_invalid_token(reason):
        return jsonify({"error": "Invalid authentication token.", "detail": reason}), 422

    @jwt.expired_token_loader
    def handle_expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "Authentication token has expired."}), 401

    return app

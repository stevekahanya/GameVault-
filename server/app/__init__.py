from flask import Flask

from app.config import Config
from app.extensions import db, migrate, bcrypt, jwt, cors


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # Import models
    from app.models import (
        User,
        Collection,
        CollectionGame,
        Favourite,
        Review,
    )

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.collections import collections_bp
    from app.routes.favourites import favourites_bp
    from app.routes.games import games_bp
    from app.routes.reviews import reviews_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(collections_bp, url_prefix="/api/collections")
    app.register_blueprint(favourites_bp, url_prefix="/api/favourites")
    app.register_blueprint(games_bp, url_prefix="/api/games")
    app.register_blueprint(reviews_bp, url_prefix="/api")

    @app.route("/")
    def home():
        return {
            "message": "Welcome to the QuestLog API!"
        }

    return app

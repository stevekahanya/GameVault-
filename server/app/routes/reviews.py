from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.models.review import Review


reviews_bp = Blueprint("reviews", __name__)


def serialize_review(review):
    return {
        "id": review.id,
        "game_id": review.game_id,
        "rating": review.rating,
        "comment": review.comment,
        "user_id": review.user_id,
        "user": review.user.username if review.user else "QuestLog Player",
        "date": review.created_at.isoformat(),
    }


@reviews_bp.route("/games/<int:game_id>/reviews", methods=["GET"])
def get_game_reviews(game_id):
    reviews = (
        Review.query
        .filter_by(game_id=game_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return jsonify([serialize_review(review) for review in reviews]), 200


@reviews_bp.route("/games/<int:game_id>/reviews", methods=["POST"])
@jwt_required()
def add_game_review(game_id):
    data = request.get_json() or {}
    comment = (data.get("comment") or "").strip()

    try:
        rating = int(data.get("rating"))
    except (TypeError, ValueError):
        rating = 0

    if rating < 1 or rating > 5 or not comment:
        return jsonify({"error": "Rating and comment are required"}), 400

    user_id = int(get_jwt_identity())
    review = Review.query.filter_by(
        game_id=game_id,
        user_id=user_id,
    ).first()

    status = 200

    if review:
        review.rating = rating
        review.comment = comment
    else:
        review = Review(
            game_id=game_id,
            user_id=user_id,
            rating=rating,
            comment=comment,
        )
        db.session.add(review)
        status = 201

    db.session.commit()

    return jsonify(serialize_review(review)), status


@reviews_bp.route(
    "/games/<int:game_id>/reviews/<int:review_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_game_review(game_id, review_id):
    review = Review.query.filter_by(
        id=review_id,
        game_id=game_id,
    ).first_or_404()

    if review.user_id != int(get_jwt_identity()):
        return jsonify({
            "error": "You can only delete your own review."
        }), 403

    db.session.delete(review)
    db.session.commit()

    return jsonify({
        "message": "Review deleted successfully."
    }), 200

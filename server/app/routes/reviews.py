"""Review routes for public reads and owner-only mutations."""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.review import Review
from app.extensions import db

reviews_bp = Blueprint("reviews", __name__, url_prefix="/api")


def current_user_id():
    """Read the authenticated user id from the JWT identity."""
    return int(get_jwt_identity())


def find_owned_review(review_id):
    """Fetch a review and reject updates/deletes from non-owners."""
    review = db.session.get(Review, review_id)

    if not review:
        return None, (jsonify({"error": "Review not found."}), 404)

    if review.user_id != current_user_id():
        return None, (jsonify({"error": "You can only modify your own reviews."}), 403)

    return review, None


def clean_review_payload(data, partial=False):
    """Validate review payloads for create and partial update requests."""
    errors = {}
    payload = {}

    if not partial or "rating" in data:
        try:
            rating = int(data.get("rating"))
            if rating < 1 or rating > 5:
                errors["rating"] = "Rating must be between 1 and 5."
            else:
                payload["rating"] = rating
        except (TypeError, ValueError):
            errors["rating"] = "Rating must be a number between 1 and 5."

    if not partial or "comment" in data:
        comment = data.get("comment", "").strip()
        if not comment:
            errors["comment"] = "Comment is required."
        else:
            payload["comment"] = comment

    return payload, errors


@reviews_bp.route("/games/<int:game_id>/reviews", methods=["GET"])
def get_game_reviews(game_id):
    """Public endpoint: show all reviews attached to a game."""
    reviews = (
        Review.query.filter_by(game_id=game_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return jsonify([review.to_dict() for review in reviews]), 200


@reviews_bp.route("/reviews", methods=["GET"])
@jwt_required()
def get_my_reviews():
    reviews = (
        Review.query.filter_by(user_id=current_user_id())
        .order_by(Review.created_at.desc())
        .all()
    )

    return jsonify([review.to_dict() for review in reviews]), 200


@reviews_bp.route("/games/<int:game_id>/reviews", methods=["POST"])
@jwt_required()
def add_game_review(game_id):
    """Create a review owned by the authenticated user."""
    data = request.get_json(silent=True) or {}
    payload, errors = clean_review_payload(data)

    if errors:
        return jsonify({"error": "Review could not be saved.", "fields": errors}), 400

    new_review = Review(
        game_id=game_id,
        user_id=current_user_id(),
        rating=payload["rating"],
        comment=payload["comment"],
    )

    db.session.add(new_review)
    db.session.commit()

    return jsonify(new_review.to_dict()), 201


@reviews_bp.route("/reviews/<int:review_id>", methods=["GET"])
@jwt_required()
def get_review(review_id):
    review, error = find_owned_review(review_id)

    if error:
        return error

    return jsonify(review.to_dict()), 200


@reviews_bp.route("/reviews/<int:review_id>", methods=["PATCH"])
@jwt_required()
def update_review(review_id):
    """Update an owned review after validating changed fields."""
    review, error = find_owned_review(review_id)

    if error:
        return error

    data = request.get_json(silent=True) or {}
    payload, errors = clean_review_payload(data, partial=True)

    if errors:
        return jsonify({"error": "Review could not be updated.", "fields": errors}), 400

    if "rating" in payload:
        review.rating = payload["rating"]

    if "comment" in payload:
        review.comment = payload["comment"]

    db.session.commit()

    return jsonify(review.to_dict()), 200


@reviews_bp.route("/reviews/<int:review_id>", methods=["DELETE"])
@jwt_required()
def delete_review(review_id):
    review, error = find_owned_review(review_id)

    if error:
        return error

    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Review deleted successfully."}), 200

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from flask import Blueprint, jsonify, request


games_bp = Blueprint("games", __name__)

RAWG_BASE_URL = "https://api.rawg.io/api"


def rawg_api_key():
    # Support both backend and existing Vite-style env names during setup.
    return os.getenv("RAWG_API_KEY") or os.getenv("VITE_RAWG_API_KEY")


def fetch_rawg(path, params=None):
    api_key = rawg_api_key()

    if not api_key:
        return None, ({
            "error": "RAWG_API_KEY is not configured on the backend."
        }, 503)

    query = {
        "key": api_key,
        **(params or {}),
    }

    url = f"{RAWG_BASE_URL}{path}?{urlencode(query)}"
    rawg_request = Request(url, headers={
        "User-Agent": "QuestLog/1.0",
    })

    try:
        with urlopen(rawg_request, timeout=12) as response:
            return json.loads(response.read().decode("utf-8")), None
    except HTTPError as error:
        return None, ({
            "error": "RAWG rejected the game request.",
            "status": error.code,
        }, error.code if 400 <= error.code < 500 else 502)
    except (TimeoutError, URLError, json.JSONDecodeError):
        return None, ({
            "error": "Unable to fetch games from RAWG right now."
        }, 502)


@games_bp.route("", methods=["GET"])
@games_bp.route("/", methods=["GET"])
def get_games():
    params = {
        "page_size": request.args.get("page_size", 20),
    }

    search = request.args.get("search")
    genre = request.args.get("genre")
    platform = request.args.get("platform")
    sort_by = request.args.get("sort_by")

    if search:
        params["search"] = search
    if genre:
        params["genres"] = genre
    if platform:
        params["platforms"] = platform
    if sort_by:
        params["ordering"] = sort_by

    data, error = fetch_rawg("/games", params)

    if error:
        body, status = error
        return jsonify(body), status

    return jsonify({
        "games": data.get("results", []),
        "count": data.get("count", 0),
    }), 200


@games_bp.route("/<int:game_id>", methods=["GET"])
def get_game_details(game_id):
    game, game_error = fetch_rawg(f"/games/{game_id}")

    if game_error:
        body, status = game_error
        return jsonify(body), status

    screenshots, screenshot_error = fetch_rawg(
        f"/games/{game_id}/screenshots",
        {"page_size": 12},
    )

    # Screenshots enrich the detail page, but the game itself should still load
    # if RAWG has a temporary issue with the screenshots endpoint.
    if screenshot_error:
        screenshots = {"results": []}

    return jsonify({
        "game": game,
        "screenshots": screenshots.get("results", []),
    }), 200

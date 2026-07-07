"""Game proxy routes that keep RAWG API access behind the Flask backend."""

import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from flask import Blueprint, current_app, jsonify, request

games_bp = Blueprint("games", __name__, url_prefix="/api/games")

RAWG_BASE_URL = "https://api.rawg.io/api"

# Fallback data mirrors the original deployed app so local demos work without RAWG credentials.
SAMPLE_GAMES = [
    {
        "id": 3498,
        "name": "Grand Theft Auto V",
        "background_image": "https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg",
        "rating": 4.47,
        "released": "2013-09-17",
        "genres": [{"slug": "action", "name": "Action"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>An open-world crime epic with heists, driving, and chaos.</p>",
    },
    {
        "id": 3328,
        "name": "The Witcher 3: Wild Hunt",
        "background_image": "https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg",
        "rating": 4.64,
        "released": "2015-05-18",
        "genres": [{"slug": "role-playing-games-rpg", "name": "RPG"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>A story-rich fantasy RPG about contracts, choices, and consequences.</p>",
    },
    {
        "id": 4200,
        "name": "Portal 2",
        "background_image": "https://media.rawg.io/media/games/2ba/2bac0e87cf45e5b508f227d281c9252a.jpg",
        "rating": 4.58,
        "released": "2011-04-18",
        "genres": [{"slug": "puzzle", "name": "Puzzle"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>A first-person puzzle game built around portals and sharp writing.</p>",
    },
    {
        "id": 4291,
        "name": "Counter-Strike: Global Offensive",
        "background_image": "https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg",
        "rating": 3.57,
        "released": "2012-08-21",
        "genres": [{"slug": "shooter", "name": "Shooter"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>A competitive team shooter built around precision, economy, and map control.</p>",
    },
    {
        "id": 5286,
        "name": "Tomb Raider",
        "background_image": "https://media.rawg.io/media/games/021/021c4e21a1824d2526f925eff6324653.jpg",
        "rating": 4.06,
        "released": "2013-03-05",
        "genres": [{"slug": "adventure", "name": "Adventure"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>Lara Croft's survival origin story across a dangerous island.</p>",
    },
    {
        "id": 13536,
        "name": "Portal",
        "background_image": "https://media.rawg.io/media/games/7fa/7fa0b586293c5861ee32490e953a4996.jpg",
        "rating": 4.49,
        "released": "2007-10-09",
        "genres": [{"slug": "puzzle", "name": "Puzzle"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>A compact puzzle classic about portals, momentum, and suspicious testing.</p>",
    },
    {
        "id": 12020,
        "name": "Left 4 Dead 2",
        "background_image": "https://media.rawg.io/media/games/d58/d588947d4286e7b5e0e12e1bea7d9844.jpg",
        "rating": 4.1,
        "released": "2009-11-17",
        "genres": [{"slug": "shooter", "name": "Shooter"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>A cooperative zombie shooter focused on replayable campaigns.</p>",
    },
    {
        "id": 28,
        "name": "Red Dead Redemption 2",
        "background_image": "https://media.rawg.io/media/games/511/5118aff5091cb3efec399c808f8c598f.jpg",
        "rating": 4.59,
        "released": "2018-10-26",
        "genres": [{"slug": "action", "name": "Action"}],
        "platforms": [{"platform": {"id": 4, "name": "PC"}}],
        "description": "<p>An expansive western about loyalty, survival, and the end of an era.</p>",
    },
]


def rawg_request(path, params):
    """Call RAWG when a key is configured; otherwise let callers use fallback data."""
    api_key = current_app.config.get("RAWG_API_KEY")

    if not api_key:
        return None

    query = urlencode({**params, "key": api_key})
    url = f"{RAWG_BASE_URL}{path}?{query}"

    try:
        with urlopen(url, timeout=8) as response:
            return json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        return None


def fallback_games(params):
    """Apply the same search/filter/sort behavior to local sample games."""
    games = SAMPLE_GAMES
    search = params.get("search", "").lower()
    genre = params.get("genres")
    platform = params.get("platforms")
    ordering = params.get("ordering")

    if search:
        games = [game for game in games if search in game["name"].lower()]

    if genre:
        games = [
            game
            for game in games
            if any(item.get("slug") == genre for item in game.get("genres", []))
        ]

    if platform:
        games = [
            game
            for game in games
            if any(
                str(item.get("platform", {}).get("id")) == str(platform)
                for item in game.get("platforms", [])
            )
        ]

    if ordering in {"rating", "-rating", "released", "-released"}:
        reverse = ordering.startswith("-")
        key = ordering.removeprefix("-")
        games = sorted(games, key=lambda game: game.get(key) or "", reverse=reverse)

    return {
        "count": len(games),
        "next": None,
        "previous": None,
        "results": games,
    }


@games_bp.route("", methods=["GET"])
def list_games():
    """List games from RAWG or the local fallback catalog."""
    params = {
        "search": request.args.get("search", ""),
        "genres": request.args.get("genre", ""),
        "platforms": request.args.get("platform", ""),
        "ordering": request.args.get("sort_by", ""),
        "page": request.args.get("page", "1"),
        "page_size": request.args.get("page_size", "20"),
    }
    params = {key: value for key, value in params.items() if value}
    data = rawg_request("/games", params) or fallback_games(params)

    return jsonify({
        "games": data.get("results", []),
        "count": data.get("count", 0),
        "next": data.get("next"),
        "previous": data.get("previous"),
    }), 200


@games_bp.route("/<int:game_id>", methods=["GET"])
def get_game(game_id):
    """Return one game's detail data, falling back to a minimal local record."""
    data = rawg_request(f"/games/{game_id}", {})

    if not data:
        data = next(
            (game for game in SAMPLE_GAMES if game["id"] == game_id),
            {
                "id": game_id,
                "name": f"Game #{game_id}",
                "background_image": None,
                "rating": None,
                "released": None,
                "description": "<p>No details are available for this game yet.</p>",
            },
        )

    return jsonify(data), 200


@games_bp.route("/<int:game_id>/screenshots", methods=["GET"])
def get_game_screenshots(game_id):
    """Proxy screenshots when available and otherwise return an empty gallery."""
    data = rawg_request(f"/games/{game_id}/screenshots", {})

    if not data:
        data = {"count": 0, "results": []}

    return jsonify(data), 200

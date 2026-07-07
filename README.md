<!-- Project handoff notes for the full-stack QuestLog auth application. -->

# QuestLog

QuestLog is a full-stack Flask and React app for discovering games, saving favourites, and writing player reviews. It uses JWT authentication, user-owned resources, namespaced API routes, and protected React routes.

## Features

- Register, log in, persist auth state, and log out with JWTs.
- Browse games through a Flask `/api/games` proxy. Add `RAWG_API_KEY` for live RAWG data, or use the built-in fallback games locally.
- Save and remove user-owned favourites.
- Create, read, update, and delete user-owned reviews.
- Collections API for another authenticated user resource.
- React routes show/hide private pages based on login state.

## Tech Stack

- Backend: Flask, SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Flask-Bcrypt
- Frontend: React, Vite, React Router
- Database: SQLite by default, configurable with `DATABASE_URI`

## Setup

1. Install backend dependencies.

   ```bash
   python3 -m venv server/venv
   source server/venv/bin/activate
   pip install -r requirements.txt
   ```

2. Configure backend environment.

   ```bash
   cp server/.env.example server/.env
   ```

   Set `SECRET_KEY` and `JWT_SECRET_KEY` to long random strings. Add `RAWG_API_KEY` if you want live game data.

3. Create the database.

   ```bash
   cd server
   flask --app run.py db upgrade
   flask --app run.py run
   ```

4. Install and run the frontend in a second terminal.

   ```bash
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

The React app runs at `http://localhost:5173` and the API runs at `http://localhost:5000`.

## API Routes

Auth:

- `POST /api/auth/register` - create an account and return a JWT.
- `POST /api/auth/login` - log in with email or username and return a JWT.
- `GET /api/auth/me` - return the current user.

Games:

- `GET /api/games` - list games, with optional `search`, `genre`, `platform`, `sort_by`, `page`, and `page_size`.
- `GET /api/games/:game_id` - get game details.
- `GET /api/games/:game_id/screenshots` - get screenshots.
- `GET /api/games/:game_id/reviews` - list public reviews for a game.
- `POST /api/games/:game_id/reviews` - create a review for the logged-in user.

Reviews:

- `GET /api/reviews` - list the logged-in user's reviews.
- `GET /api/reviews/:review_id` - get one owned review.
- `PATCH /api/reviews/:review_id` - update one owned review.
- `DELETE /api/reviews/:review_id` - delete one owned review.

Favourites:

- `GET /api/favourites/` - list the logged-in user's saved games.
- `POST /api/favourites/` - save a game for the logged-in user.
- `DELETE /api/favourites/:game_id` - remove a saved game owned by the logged-in user.

Collections:

- `GET /api/collections/` - list the logged-in user's collections.
- `POST /api/collections/` - create a collection.
- `GET /api/collections/:collection_id` - get one owned collection.
- `PATCH /api/collections/:collection_id` - update one owned collection.
- `DELETE /api/collections/:collection_id` - delete one owned collection.
- `POST /api/collections/:collection_id/games` - add a game to a collection.
- `DELETE /api/collections/:collection_id/games/:game_id` - remove a game from a collection.

## Security Notes

- Passwords are hashed with bcrypt.
- JWT secrets and external API keys belong in `.env` files, not source code.
- User-owned routes derive `user_id` from the JWT and never trust client-submitted ownership.
- Review, favourite, and collection update/delete routes enforce owner-only access.

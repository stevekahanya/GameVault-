"""Vercel serverless entrypoint for the QuestLog Flask API."""

import os
import sys

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SERVER_DIR = os.path.join(ROOT_DIR, "server")

if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

os.environ.setdefault("DATABASE_URI", "sqlite:////tmp/questlog.db")

from app import create_app
from app.extensions import db

app = create_app()

with app.app_context():
    db.create_all()

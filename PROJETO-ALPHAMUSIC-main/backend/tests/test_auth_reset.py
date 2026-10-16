"""Focused tests for admin credential reset verification.

Scope (per review request):
 - POST /api/auth/login success with cesar@escolamusica.com / Musica@2026
 - POST /api/auth/login wrong password returns 401
 - GET /api/auth/me with returned token returns admin profile
 - Confirm exactly one admin user exists in DB with that email (no duplicates)
"""
import os
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "cesar@escolamusica.com"
ADMIN_PASSWORD = "Musica@2026"

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

session = requests.Session()
session.headers.update({"Content-Type": "application/json"})

state = {"token": None}


# ---------- Auth reset verification ----------
def test_login_wrong_password_returns_401():
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG_PASS_123"})
    assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"


def test_login_success_returns_token_and_user():
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
    assert "user" in data
    user = data["user"]
    assert user["email"] == ADMIN_EMAIL
    # Make sure no password_hash leaked
    assert "password_hash" not in user
    state["token"] = data["token"]


def test_auth_me_with_token_returns_admin_profile():
    assert state["token"], "Previous login test must have populated token"
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {state['token']}"})
    assert r.status_code == 200, f"/auth/me failed: {r.status_code} {r.text}"
    me = r.json()
    assert me["email"] == ADMIN_EMAIL
    assert "password_hash" not in me


def test_auth_me_without_token_returns_401():
    r = session.get(f"{API}/auth/me")
    assert r.status_code == 401


# ---------- DB integrity: single admin, no duplicates ----------
def test_only_one_admin_user_in_db():
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    try:
        db = client[DB_NAME]
        # Try common collection names
        collections = db.list_collection_names()
        candidates = [c for c in collections if c.lower() in {"users", "user", "admins"}]
        if not candidates:
            pytest.skip(f"No users collection found. Collections: {collections}")
        total_matches = 0
        for coll in candidates:
            count = db[coll].count_documents({"email": ADMIN_EMAIL})
            total_matches += count
        assert total_matches == 1, f"Expected exactly 1 admin with email {ADMIN_EMAIL}, found {total_matches} across {candidates}"
    finally:
        client.close()

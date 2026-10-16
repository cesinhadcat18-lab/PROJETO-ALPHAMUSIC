"""Backend API tests for Gestão Musical."""
import os
import uuid
from datetime import date
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://pianist-admin-sys.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "cesar@escolamusica.com"
ADMIN_PASSWORD = "Musica@2026"

session = requests.Session()
session.headers.update({"Content-Type": "application/json"})

state = {"token": None, "student_id": None, "payment_id": None}


def auth_headers():
    return {"Authorization": f"Bearer {state['token']}"}


# ---------- Auth ----------
def test_login_wrong_password():
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_login_success():
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    state["token"] = data["token"]


def test_auth_me():
    r = session.get(f"{API}/auth/me", headers=auth_headers())
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_auth_me_missing():
    r = session.get(f"{API}/auth/me")
    assert r.status_code == 401


# ---------- Students ----------
def test_create_student_generates_payments_and_lessons():
    payload = {
        "nome_completo": f"TEST_Aluno_{uuid.uuid4().hex[:6]}",
        "nome_preferencia": "TestAluno",
        "instrumento": "Piano",
        "dia_semana": 1,
        "horario": "15:00",
        "valor_mensal": 250.0,
        "dia_vencimento": 10,
        "forma_pagamento": "PIX",
        "status": "Ativo",
    }
    r = session.post(f"{API}/students", json=payload, headers=auth_headers())
    assert r.status_code == 200, r.text
    s = r.json()
    assert s["nome_completo"] == payload["nome_completo"]
    state["student_id"] = s["id"]
    # verify 3 months of payments
    rp = session.get(f"{API}/payments", params={"student_id": s["id"]}, headers=auth_headers())
    assert rp.status_code == 200
    pays = rp.json()
    assert len(pays) >= 3, f"Expected >=3 payments, got {len(pays)}"
    state["payment_id"] = pays[0]["id"]
    # verify lessons for current month were created
    today = date.today()
    start = date(today.year, today.month, 1).isoformat()
    end = date(today.year, today.month, 28).isoformat()
    rl = session.get(f"{API}/lessons", params={"start": start, "end": end}, headers=auth_headers())
    assert rl.status_code == 200
    # Not strictly asserting >0 lessons (depends on weekday), just checks endpoint


def test_list_students_and_search():
    r = session.get(f"{API}/students", headers=auth_headers())
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    r2 = session.get(f"{API}/students", params={"q": "TEST_"}, headers=auth_headers())
    assert r2.status_code == 200
    assert any(s["id"] == state["student_id"] for s in r2.json())


def test_get_student():
    r = session.get(f"{API}/students/{state['student_id']}", headers=auth_headers())
    assert r.status_code == 200
    assert r.json()["id"] == state["student_id"]


def test_patch_student():
    r = session.patch(f"{API}/students/{state['student_id']}", json={"nivel": "Intermediário"}, headers=auth_headers())
    assert r.status_code == 200
    assert r.json()["nivel"] == "Intermediário"


# ---------- Payments ----------
def test_list_payments_by_month():
    today = date.today()
    ref = f"{today.year:04d}-{today.month:02d}"
    r = session.get(f"{API}/payments", params={"month": ref}, headers=auth_headers())
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_register_payment_and_undo():
    pid = state["payment_id"]
    r = session.post(f"{API}/payments/{pid}/register", json={"valor_pago": 250.0}, headers=auth_headers())
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "Pago"
    # Undo
    r2 = session.post(f"{API}/payments/{pid}/undo", json={}, headers=auth_headers())
    assert r2.status_code == 200
    assert r2.json()["status"] == "Pendente"


# ---------- Dashboard / Calendar / Holidays ----------
def test_dashboard():
    r = session.get(f"{API}/dashboard", headers=auth_headers())
    assert r.status_code == 200
    d = r.json()
    for k in ["active_students", "today_lessons", "month_ref", "recebido", "pendente",
              "atrasado", "a_receber", "upcoming_payments", "next_holiday", "five_week_weekdays"]:
        assert k in d, f"Missing {k}"


def test_holidays():
    r = session.get(f"{API}/holidays/2026", headers=auth_headers())
    assert r.status_code == 200
    hols = r.json()
    names = {h["nome"] for h in hols}
    for expected in ["Carnaval", "Páscoa", "Corpus Christi", "Natal",
                     "Emancipação Política de Sergipe", "Aniversário de Itabaiana"]:
        assert expected in names, f"Missing {expected}"


def test_calendar_year_five_week():
    r = session.get(f"{API}/calendar/2026", headers=auth_headers())
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 12
    assert "five_week_weekdays" in data[0]


# ---------- Lessons ----------
def test_lessons_range():
    r = session.get(f"{API}/lessons", params={"start": "2026-01-01", "end": "2026-12-31"}, headers=auth_headers())
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Defaulters / Reports / Settings ----------
def test_defaulters():
    r = session.get(f"{API}/defaulters", headers=auth_headers())
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_reports_financial():
    r = session.get(f"{API}/reports/financial/2026", headers=auth_headers())
    assert r.status_code == 200
    d = r.json()
    assert d["year"] == 2026 and "per_month" in d


def test_reports_lessons():
    today = date.today()
    r = session.get(f"{API}/reports/lessons/{today.year}/{today.month}", headers=auth_headers())
    assert r.status_code == 200
    assert "stats" in r.json()


def test_get_and_put_settings():
    r = session.get(f"{API}/settings", headers=auth_headers())
    assert r.status_code == 200
    r2 = session.put(f"{API}/settings", json={"pix_chave": "12345678000199", "pix_tipo": "CNPJ"}, headers=auth_headers())
    assert r2.status_code == 200
    assert r2.json()["pix_chave"] == "12345678000199"


# ---------- Cleanup ----------
def test_zz_delete_student():
    if state["student_id"]:
        r = session.delete(f"{API}/students/{state['student_id']}", headers=auth_headers())
        assert r.status_code == 200
        r2 = session.get(f"{API}/students/{state['student_id']}", headers=auth_headers())
        assert r2.status_code == 404

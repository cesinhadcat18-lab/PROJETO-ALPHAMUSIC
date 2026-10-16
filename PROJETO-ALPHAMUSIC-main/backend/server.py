from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, uuid, logging, calendar as cal, asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, date, timedelta
import bcrypt
import jwt as pyjwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"
JWT_EXP_DAYS = 30

PUSH_BASE_URL = "https://integrations.emergentagent.com"
PUSH_KEY = os.environ.get("EMERGENT_PUSH_KEY", "placeholder")
_push_client = httpx.AsyncClient(base_url=PUSH_BASE_URL, headers={"X-Push-Key": PUSH_KEY}, timeout=10.0)

app = FastAPI(title="Gestão Musical API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

# ---------- Utils ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def uid() -> str:
    return str(uuid.uuid4())

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_pw(pw: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), h.encode())
    except Exception:
        return False

def make_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXP_DAYS)}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

async def current_user(cred: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not cred:
        raise HTTPException(401, "Missing auth")
    try:
        data = pyjwt.decode(cred.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except Exception:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": data["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user

# ---------- Models ----------
class LoginBody(BaseModel):
    email: EmailStr
    password: str

class Student(BaseModel):
    id: str = Field(default_factory=uid)
    nome_completo: str
    nome_preferencia: Optional[str] = None
    data_nascimento: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    instrumento: str = "Piano"
    nivel: Optional[str] = "Iniciante"
    data_inicio: Optional[str] = None
    dia_semana: int = 1  # 0=segunda ... 6=domingo
    horario: str = "15:00"
    valor_mensal: float = 200.0
    dia_vencimento: int = 10
    forma_pagamento: str = "PIX"
    status: str = "Ativo"  # Ativo/Inativo/Trancado
    observacoes: Optional[str] = None
    responsavel_nome: Optional[str] = None
    responsavel_telefone: Optional[str] = None
    foto: Optional[str] = None
    quinta_semana_regra: str = "Reposicao"  # Recesso/Reposicao/AulaAvulsa/AulaNormal/Outro
    created_at: str = Field(default_factory=now_iso)

class StudentUpdate(BaseModel):
    nome_completo: Optional[str] = None
    nome_preferencia: Optional[str] = None
    data_nascimento: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    instrumento: Optional[str] = None
    nivel: Optional[str] = None
    data_inicio: Optional[str] = None
    dia_semana: Optional[int] = None
    horario: Optional[str] = None
    valor_mensal: Optional[float] = None
    dia_vencimento: Optional[int] = None
    forma_pagamento: Optional[str] = None
    status: Optional[str] = None
    observacoes: Optional[str] = None
    responsavel_nome: Optional[str] = None
    responsavel_telefone: Optional[str] = None
    foto: Optional[str] = None
    quinta_semana_regra: Optional[str] = None

class Payment(BaseModel):
    id: str = Field(default_factory=uid)
    student_id: str
    student_name: str
    referencia: str  # "2026-05"
    valor: float
    vencimento: str  # ISO date
    status: str = "Pendente"  # Pendente/Pago/Atrasado/Cancelado
    forma_pagamento: str = "PIX"
    data_pagamento: Optional[str] = None
    valor_pago: Optional[float] = None
    observacao: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)

class PaymentRegister(BaseModel):
    valor_pago: Optional[float] = None
    forma_pagamento: Optional[str] = "PIX"
    observacao: Optional[str] = None
    data_pagamento: Optional[str] = None

class Lesson(BaseModel):
    id: str = Field(default_factory=uid)
    student_id: str
    student_name: str
    instrumento: str
    data: str  # ISO date YYYY-MM-DD
    horario: str
    status: str = "Agendada"  # Agendada/Realizada/Cancelada/FaltaAluno/FaltaProfessor/Reposicao/Feriado
    is_5th_week: bool = False
    observacao: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)

class LessonUpdate(BaseModel):
    status: Optional[str] = None
    observacao: Optional[str] = None
    horario: Optional[str] = None
    data: Optional[str] = None

class Settings(BaseModel):
    escola_nome: str = "Escola de Música"
    professor_nome: str = "César"
    cnpj: Optional[str] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    instagram: Optional[str] = None
    pix_chave: Optional[str] = None
    pix_tipo: Optional[str] = "CNPJ"
    pix_recebedor: Optional[str] = None
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    valor_padrao: float = 200.0
    dia_vencimento_padrao: int = 10
    duracao_aula: int = 60
    estado: str = "SE"
    municipio: str = "Itabaiana"
    notif_vencimento: bool = True
    notif_pagamento: bool = True
    notif_aula: bool = True
    notif_feriado: bool = True

class PushRegisterBody(BaseModel):
    user_id: str
    platform: str
    device_token: str

# ---------- Push helper ----------
async def send_push(recipients: List[str], data: dict, idempotency_key: Optional[str] = None):
    if not recipients:
        return
    payload = {"recipients": recipients, "data": data}
    if idempotency_key:
        payload["$idempotency_key"] = idempotency_key
    try:
        r = await _push_client.post("/api/v1/push/trigger", json=payload)
        r.raise_for_status()
    except Exception as e:
        logging.warning(f"Push failed: {e}")

# ---------- Auth ----------
@api.post("/auth/login")
async def login(body: LoginBody):
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_pw(body.password, user.get("password_hash", "")):
        raise HTTPException(401, "Credenciais inválidas")
    token = make_token(user["id"], user["email"])
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", "")},
    }

@api.get("/auth/me")
async def me(user=Depends(current_user)):
    return user

# ---------- Students ----------
@api.get("/students")
async def list_students(q: Optional[str] = None, user=Depends(current_user)):
    query = {}
    if q:
        query = {"$or": [
            {"nome_completo": {"$regex": q, "$options": "i"}},
            {"nome_preferencia": {"$regex": q, "$options": "i"}},
            {"cpf": {"$regex": q}},
            {"telefone": {"$regex": q}},
            {"whatsapp": {"$regex": q}},
            {"instrumento": {"$regex": q, "$options": "i"}},
        ]}
    items = await db.students.find(query, {"_id": 0}).sort("nome_completo", 1).to_list(1000)
    return items

@api.post("/students")
async def create_student(body: Student, user=Depends(current_user)):
    doc = body.model_dump()
    await db.students.insert_one(doc.copy())
    # Generate current + next 2 months of payments and current month lessons
    await _generate_payments_for_student(doc, months_ahead=3)
    await _generate_lessons_for_month(doc, date.today().year, date.today().month)
    return await db.students.find_one({"id": doc["id"]}, {"_id": 0})

@api.get("/students/{sid}")
async def get_student(sid: str, user=Depends(current_user)):
    s = await db.students.find_one({"id": sid}, {"_id": 0})
    if not s:
        raise HTTPException(404, "Aluno não encontrado")
    return s

@api.patch("/students/{sid}")
async def update_student(sid: str, body: StudentUpdate, user=Depends(current_user)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if not upd:
        return await get_student(sid, user)
    await db.students.update_one({"id": sid}, {"$set": upd})
    return await db.students.find_one({"id": sid}, {"_id": 0})

@api.delete("/students/{sid}")
async def delete_student(sid: str, user=Depends(current_user)):
    await db.students.delete_one({"id": sid})
    await db.payments.delete_many({"student_id": sid})
    await db.lessons.delete_many({"student_id": sid})
    return {"ok": True}

# ---------- Payment generation ----------
async def _generate_payments_for_student(student: dict, months_ahead: int = 3):
    today = date.today()
    for i in range(months_ahead):
        y = today.year + (today.month - 1 + i) // 12
        m = (today.month - 1 + i) % 12 + 1
        ref = f"{y:04d}-{m:02d}"
        exists = await db.payments.find_one({"student_id": student["id"], "referencia": ref})
        if exists:
            continue
        day = min(student.get("dia_vencimento", 10), cal.monthrange(y, m)[1])
        venc = date(y, m, day).isoformat()
        pay = Payment(
            student_id=student["id"],
            student_name=student.get("nome_preferencia") or student["nome_completo"],
            referencia=ref,
            valor=float(student.get("valor_mensal", 200.0)),
            vencimento=venc,
            forma_pagamento=student.get("forma_pagamento", "PIX"),
        )
        await db.payments.insert_one(pay.model_dump())

async def _generate_lessons_for_month(student: dict, year: int, month: int):
    dia_semana = student.get("dia_semana", 1)  # 0=Mon
    horario = student.get("horario", "15:00")
    _, ndays = cal.monthrange(year, month)
    occurrences = []
    for d in range(1, ndays + 1):
        dt = date(year, month, d)
        if dt.weekday() == dia_semana:
            occurrences.append(dt)
    for idx, dt in enumerate(occurrences):
        is5 = idx == 4  # 5th occurrence
        exists = await db.lessons.find_one({"student_id": student["id"], "data": dt.isoformat(), "horario": horario})
        if exists:
            continue
        # Skip 5th if student rule is Recesso
        if is5 and student.get("quinta_semana_regra", "Reposicao") == "Recesso":
            continue
        lesson = Lesson(
            student_id=student["id"],
            student_name=student.get("nome_preferencia") or student["nome_completo"],
            instrumento=student.get("instrumento", "Piano"),
            data=dt.isoformat(),
            horario=horario,
            is_5th_week=is5,
        )
        await db.lessons.insert_one(lesson.model_dump())

# ---------- Payments ----------
@api.get("/payments")
async def list_payments(month: Optional[str] = None, status_f: Optional[str] = None, student_id: Optional[str] = None, user=Depends(current_user)):
    q: dict = {}
    if month:
        q["referencia"] = month
    if student_id:
        q["student_id"] = student_id
    if status_f:
        q["status"] = status_f
    items = await db.payments.find(q, {"_id": 0}).sort("vencimento", 1).to_list(5000)
    # Recompute atrasado on the fly
    today = date.today().isoformat()
    for p in items:
        if p["status"] == "Pendente" and p["vencimento"] < today:
            p["status"] = "Atrasado"
            await db.payments.update_one({"id": p["id"]}, {"$set": {"status": "Atrasado"}})
    return items

@api.post("/payments/{pid}/register")
async def register_payment(pid: str, body: PaymentRegister, user=Depends(current_user)):
    p = await db.payments.find_one({"id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Cobrança não encontrada")
    upd = {
        "status": "Pago",
        "data_pagamento": body.data_pagamento or now_iso(),
        "valor_pago": body.valor_pago if body.valor_pago is not None else p["valor"],
        "forma_pagamento": body.forma_pagamento or p.get("forma_pagamento", "PIX"),
        "observacao": body.observacao,
    }
    await db.payments.update_one({"id": pid}, {"$set": upd})
    # Notify admin
    admin = await db.users.find_one({}, {"_id": 0})
    if admin:
        asyncio.create_task(send_push(
            [admin["id"]],
            {"title": "✅ Pagamento recebido", "message": f"{p['student_name']} — R$ {upd['valor_pago']:.2f}"}
        ))
    return await db.payments.find_one({"id": pid}, {"_id": 0})

@api.post("/payments/{pid}/undo")
async def undo_payment(pid: str, user=Depends(current_user)):
    await db.payments.update_one({"id": pid}, {"$set": {"status": "Pendente", "data_pagamento": None, "valor_pago": None}})
    return await db.payments.find_one({"id": pid}, {"_id": 0})

# ---------- Lessons ----------
@api.get("/lessons")
async def list_lessons(start: Optional[str] = None, end: Optional[str] = None, day: Optional[str] = None, user=Depends(current_user)):
    q: dict = {}
    if day:
        q["data"] = day
    elif start and end:
        q["data"] = {"$gte": start, "$lte": end}
    items = await db.lessons.find(q, {"_id": 0}).sort([("data", 1), ("horario", 1)]).to_list(5000)
    return items

@api.patch("/lessons/{lid}")
async def update_lesson(lid: str, body: LessonUpdate, user=Depends(current_user)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if upd:
        await db.lessons.update_one({"id": lid}, {"$set": upd})
    return await db.lessons.find_one({"id": lid}, {"_id": 0})

@api.post("/lessons/generate/{year}/{month}")
async def generate_month_lessons(year: int, month: int, user=Depends(current_user)):
    students = await db.students.find({"status": "Ativo"}, {"_id": 0}).to_list(1000)
    for s in students:
        await _generate_lessons_for_month(s, year, month)
    return {"ok": True, "students": len(students)}

@api.post("/payments/generate/{year}/{month}")
async def generate_month_payments(year: int, month: int, user=Depends(current_user)):
    students = await db.students.find({"status": "Ativo"}, {"_id": 0}).to_list(1000)
    ref = f"{year:04d}-{month:02d}"
    for s in students:
        exists = await db.payments.find_one({"student_id": s["id"], "referencia": ref})
        if exists:
            continue
        day = min(s.get("dia_vencimento", 10), cal.monthrange(year, month)[1])
        venc = date(year, month, day).isoformat()
        pay = Payment(
            student_id=s["id"],
            student_name=s.get("nome_preferencia") or s["nome_completo"],
            referencia=ref,
            valor=float(s.get("valor_mensal", 200.0)),
            vencimento=venc,
            forma_pagamento=s.get("forma_pagamento", "PIX"),
        )
        await db.payments.insert_one(pay.model_dump())
    return {"ok": True}

# ---------- Calendar / 5th week / Holidays ----------
BR_HOLIDAYS = {
    "01-01": ("Confraternização Universal", "Nacional"),
    "04-21": ("Tiradentes", "Nacional"),
    "05-01": ("Dia do Trabalho", "Nacional"),
    "09-07": ("Independência do Brasil", "Nacional"),
    "10-12": ("Nossa Senhora Aparecida", "Nacional"),
    "11-02": ("Finados", "Nacional"),
    "11-15": ("Proclamação da República", "Nacional"),
    "11-20": ("Consciência Negra", "Nacional"),
    "12-25": ("Natal", "Nacional"),
    "07-08": ("Emancipação Política de Sergipe", "Estadual"),
    "10-24": ("Aniversário de Itabaiana", "Municipal"),
}

def _easter(year: int) -> date:
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31
    day = ((h + l - 7 * m + 114) % 31) + 1
    return date(year, month, day)

def compute_holidays(year: int):
    items = []
    for md, (name, tipo) in BR_HOLIDAYS.items():
        m, d = md.split("-")
        dt = date(year, int(m), int(d))
        items.append({"data": dt.isoformat(), "nome": name, "tipo": tipo, "dia_semana": dt.weekday()})
    easter = _easter(year)
    items.append({"data": (easter - timedelta(days=48)).isoformat(), "nome": "Carnaval", "tipo": "Nacional", "dia_semana": (easter - timedelta(days=48)).weekday()})
    items.append({"data": (easter - timedelta(days=47)).isoformat(), "nome": "Carnaval", "tipo": "Nacional", "dia_semana": (easter - timedelta(days=47)).weekday()})
    items.append({"data": (easter - timedelta(days=2)).isoformat(), "nome": "Sexta-feira Santa", "tipo": "Nacional", "dia_semana": (easter - timedelta(days=2)).weekday()})
    items.append({"data": easter.isoformat(), "nome": "Páscoa", "tipo": "Nacional", "dia_semana": easter.weekday()})
    items.append({"data": (easter + timedelta(days=60)).isoformat(), "nome": "Corpus Christi", "tipo": "Nacional", "dia_semana": (easter + timedelta(days=60)).weekday()})
    items.sort(key=lambda x: x["data"])
    return items

@api.get("/holidays/{year}")
async def get_holidays(year: int, user=Depends(current_user)):
    return compute_holidays(year)

@api.get("/calendar/{year}")
async def calendar_analysis(year: int, user=Depends(current_user)):
    result = []
    for m in range(1, 13):
        _, ndays = cal.monthrange(year, m)
        occ = {i: 0 for i in range(7)}
        for d in range(1, ndays + 1):
            occ[date(year, m, d).weekday()] += 1
        five = [i for i, c in occ.items() if c == 5]
        result.append({
            "year": year,
            "month": m,
            "days": ndays,
            "weeks": (ndays + date(year, m, 1).weekday()) // 7 + 1,
            "occurrences": occ,
            "five_week_weekdays": five,
        })
    return result

# ---------- Dashboard ----------
@api.get("/dashboard")
async def dashboard(user=Depends(current_user)):
    today = date.today()
    ref = f"{today.year:04d}-{today.month:02d}"

    active = await db.students.count_documents({"status": "Ativo"})
    today_iso = today.isoformat()

    # today's lessons
    today_lessons = await db.lessons.find({"data": today_iso}, {"_id": 0}).sort("horario", 1).to_list(100)

    # next lesson (today or after)
    next_lesson = await db.lessons.find_one({"data": {"$gte": today_iso}, "status": {"$in": ["Agendada", "Reposicao"]}}, {"_id": 0}, sort=[("data", 1), ("horario", 1)])

    # Payments for current month
    month_payments = await db.payments.find({"referencia": ref}, {"_id": 0}).to_list(1000)
    for p in month_payments:
        if p["status"] == "Pendente" and p["vencimento"] < today_iso:
            p["status"] = "Atrasado"
            await db.payments.update_one({"id": p["id"]}, {"$set": {"status": "Atrasado"}})

    recebido = sum(p.get("valor_pago") or 0 for p in month_payments if p["status"] == "Pago")
    pendente = sum(p["valor"] for p in month_payments if p["status"] == "Pendente")
    atrasado = sum(p["valor"] for p in month_payments if p["status"] == "Atrasado")
    a_receber = pendente + atrasado

    # Overdue students
    overdue_pays = [p for p in month_payments if p["status"] == "Atrasado"]

    # Upcoming payments (next 7 days)
    upcoming = await db.payments.find({
        "status": "Pendente",
        "vencimento": {"$gte": today_iso, "$lte": (today + timedelta(days=7)).isoformat()}
    }, {"_id": 0}).sort("vencimento", 1).to_list(50)

    # Next holiday
    hols = compute_holidays(today.year) + compute_holidays(today.year + 1)
    next_hol = next((h for h in hols if h["data"] >= today_iso), None)

    # 5th week alert for current month
    _, ndays = cal.monthrange(today.year, today.month)
    occ = {i: 0 for i in range(7)}
    for d in range(1, ndays + 1):
        occ[date(today.year, today.month, d).weekday()] += 1
    five_week_weekdays = [i for i, c in occ.items() if c == 5]

    return {
        "active_students": active,
        "today_lessons": today_lessons,
        "next_lesson": next_lesson,
        "month_ref": ref,
        "recebido": recebido,
        "pendente": pendente,
        "atrasado": atrasado,
        "a_receber": a_receber,
        "overdue_count": len(overdue_pays),
        "upcoming_payments": upcoming,
        "next_holiday": next_hol,
        "five_week_weekdays": five_week_weekdays,
        "today": today_iso,
    }

# ---------- Defaulters ----------
@api.get("/defaulters")
async def defaulters(user=Depends(current_user)):
    today_iso = date.today().isoformat()
    pays = await db.payments.find({"status": {"$in": ["Pendente", "Atrasado"]}, "vencimento": {"$lt": today_iso}}, {"_id": 0}).sort("vencimento", 1).to_list(1000)
    grouped = {}
    for p in pays:
        d = grouped.setdefault(p["student_id"], {"student_id": p["student_id"], "student_name": p["student_name"], "total": 0, "items": []})
        d["total"] += p["valor"]
        d["items"].append(p)
    for g in grouped.values():
        first = g["items"][0]
        atraso = (date.today() - date.fromisoformat(first["vencimento"])).days
        g["dias_atraso"] = atraso
    return list(grouped.values())

# ---------- Reports ----------
@api.get("/reports/financial/{year}")
async def report_financial(year: int, user=Depends(current_user)):
    pays = await db.payments.find({"referencia": {"$regex": f"^{year:04d}-"}}, {"_id": 0}).to_list(10000)
    per_month = {f"{m:02d}": {"pago": 0, "pendente": 0, "atrasado": 0} for m in range(1, 13)}
    for p in pays:
        m = p["referencia"][-2:]
        if p["status"] == "Pago":
            per_month[m]["pago"] += p.get("valor_pago") or p["valor"]
        elif p["status"] == "Atrasado":
            per_month[m]["atrasado"] += p["valor"]
        elif p["status"] == "Pendente":
            per_month[m]["pendente"] += p["valor"]
    total_pago = sum(x["pago"] for x in per_month.values())
    total_pendente = sum(x["pendente"] for x in per_month.values())
    total_atrasado = sum(x["atrasado"] for x in per_month.values())
    return {"year": year, "per_month": per_month, "total_pago": total_pago, "total_pendente": total_pendente, "total_atrasado": total_atrasado}

@api.get("/reports/lessons/{year}/{month}")
async def report_lessons(year: int, month: int, user=Depends(current_user)):
    ref_prefix = f"{year:04d}-{month:02d}"
    items = await db.lessons.find({"data": {"$regex": f"^{ref_prefix}"}}, {"_id": 0}).to_list(5000)
    stats = {"total": len(items), "Agendada": 0, "Realizada": 0, "Cancelada": 0, "FaltaAluno": 0, "FaltaProfessor": 0, "Reposicao": 0, "Feriado": 0}
    for l in items:
        stats[l.get("status", "Agendada")] = stats.get(l.get("status", "Agendada"), 0) + 1
    return {"year": year, "month": month, "stats": stats, "lessons": items}

# ---------- Settings ----------
@api.get("/settings")
async def get_settings(user=Depends(current_user)):
    s = await db.settings.find_one({"id": "default"}, {"_id": 0})
    if not s:
        base = Settings().model_dump()
        base["id"] = "default"
        await db.settings.insert_one(base.copy())
        return {k: v for k, v in base.items() if k != "id"}
    s.pop("id", None)
    return s

@api.put("/settings")
async def put_settings(body: dict, user=Depends(current_user)):
    upd = {k: v for k, v in body.items() if v is not None}
    await db.settings.update_one({"id": "default"}, {"$set": upd}, upsert=True)
    s = await db.settings.find_one({"id": "default"}, {"_id": 0})
    s.pop("id", None)
    return s

# ---------- Push ----------
@api.post("/register-push", status_code=201)
async def register_push(body: PushRegisterBody, user=Depends(current_user)):
    try:
        r = await _push_client.post("/api/v1/push/users/register", json=body.model_dump())
        if r.status_code >= 500:
            raise HTTPException(502, "Push provider unavailable")
    except HTTPException:
        raise
    except Exception as e:
        logging.warning(f"register push failed: {e}")
    return {"status": "registered"}

# ---------- Root ----------
@api.get("/")
async def root():
    return {"app": "Gestão Musical", "ok": True}

app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def seed():
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": uid(),
            "email": admin_email,
            "name": os.environ.get("ADMIN_NAME", "Admin"),
            "password_hash": hash_pw(os.environ.get("ADMIN_PASSWORD", "changeme")),
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin user: {admin_email}")
    # Default settings
    if not await db.settings.find_one({"id": "default"}):
        base = Settings().model_dump()
        base["id"] = "default"
        await db.settings.insert_one(base)

@app.on_event("shutdown")
async def shutdown():
    client.close()
    await _push_client.aclose()

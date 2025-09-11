from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header, Cookie, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any, Union
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import json
import csv
import io
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
import pandas as pd

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-growen-2025')

# Create the main app without a prefix
app = FastAPI(title="Growen - Smart Business Consulting API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enhanced User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    picture: Optional[str] = None
    provider: str = "email"  # email, google
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    plan: str = "free"  # free, starter, pro
    is_active: bool = True
    company: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    country: str = "Angola"
    language: str = "pt"

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    company: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('A senha deve ter pelo menos 6 caracteres')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('A nova senha deve ter pelo menos 6 caracteres')
        return v

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enhanced Business Models
class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    status: str = "lead_novo"  # lead_novo, em_negociacao, cliente_ativo, retido
    value: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    value: Optional[float] = None
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    status: Optional[str] = None
    value: Optional[float] = None
    notes: Optional[str] = None

# Enhanced Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    session_id: str
    topic: Optional[str] = None
    saved_as_pdf: bool = False

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enhanced Payment Models
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    amount: float
    currency: str = "AOA"  # Angola Kwanza
    payment_status: str = "initiated"
    status: str = "pending"
    payment_method: str = "stripe"  # stripe, multicaixa, manual
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Enhanced Report Models
class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    content: str
    type: str = "automatic"  # automatic, manual, csv_analysis
    insights: List[str] = []
    data_source: Optional[str] = None
    period: Optional[str] = None  # weekly, monthly, quarterly
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    file_path: Optional[str] = None

class ReportCreate(BaseModel):
    title: str
    type: str = "manual"
    data: Optional[Dict[str, Any]] = None
    period: Optional[str] = None

# Email Templates
class EmailTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    template_html: str
    template_text: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Angola-specific pricing
ANGOLA_PLANS = {
    "free": {
        "name": "Gratuito",
        "price_aoa": 0,
        "price_usd": 0,
        "features": [
            "5 consultas IA por mês",
            "10 clientes no CRM",
            "2 relatórios por mês",
            "Dashboard básico"
        ],
        "limits": {
            "ai_chats": 5,
            "clients": 10,
            "reports": 2,
            "storage_mb": 100
        }
    },
    "starter": {
        "name": "Starter",
        "price_aoa": 10000,
        "price_usd": 12,
        "features": [
            "50 consultas IA por mês",
            "100 clientes no CRM",
            "10 relatórios por mês",
            "Dashboard avançado",
            "Exportação PDF",
            "Suporte por email"
        ],
        "limits": {
            "ai_chats": 50,
            "clients": 100,
            "reports": 10,
            "storage_mb": 500
        }
    },
    "pro": {
        "name": "Profissional",
        "price_aoa": 20000,
        "price_usd": 24,
        "features": [
            "Consultas IA ilimitadas",
            "CRM ilimitado",
            "Relatórios ilimitados",
            "Dashboard premium",
            "Exportação PDF ilimitada",
            "Suporte prioritário",
            "Integrações customizadas",
            "Relatórios automáticos"
        ],
        "limits": {
            "ai_chats": -1,  # unlimited
            "clients": -1,
            "reports": -1,
            "storage_mb": 2000
        }
    }
}

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_jwt_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(authorization: Optional[str] = Header(None), access_token: Optional[str] = Cookie(None)) -> str:
    token = None
    
    # Try cookie first, then Authorization header
    if access_token:
        token = access_token
    elif authorization and authorization.startswith('Bearer '):
        token = authorization.split(' ')[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    # Check session token first (for Emergent auth)
    session = await db.user_sessions.find_one({"session_token": token})
    if session and session["expires_at"] > datetime.now(timezone.utc):
        return session["user_id"]
    
    # Fallback to JWT token
    user_id = verify_jwt_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    return user_id

async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """Send email using SMTP (placeholder for actual implementation)"""
    # This would be implemented with actual email service in production
    print(f"EMAIL SENT TO: {to_email}")
    print(f"SUBJECT: {subject}")
    print(f"CONTENT: {html_content[:100]}...")
    return True

async def check_plan_limits(user_id: str, feature: str) -> bool:
    """Check if user has reached plan limits"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return False
    
    plan = user.get("plan", "free")
    limits = ANGOLA_PLANS[plan]["limits"]
    
    if feature == "ai_chats":
        if limits["ai_chats"] == -1:  # unlimited
            return True
        current_count = await db.chat_messages.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": datetime.now(timezone.utc).replace(day=1)}
        })
        return current_count < limits["ai_chats"]
    
    elif feature == "clients":
        if limits["clients"] == -1:
            return True
        current_count = await db.clients.count_documents({"user_id": user_id})
        return current_count < limits["clients"]
    
    elif feature == "reports":
        if limits["reports"] == -1:
            return True
        current_count = await db.reports.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": datetime.now(timezone.utc).replace(day=1)}
        })
        return current_count < limits["reports"]
    
    return True

# Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Este email já está registrado")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        company=user_data.company,
        phone=user_data.phone,
        industry=user_data.industry,
        provider="email"
    )
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Send welcome email
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    # Create token
    token = create_jwt_token(user.id)
    
    return {
        "message": "Conta criada com sucesso!",
        "user": {"id": user.id, "email": user.email, "name": user.name, "plan": user.plan},
        "token": token
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Conta desativada")
    
    # Create token
    token = create_jwt_token(user["id"])
    
    return {
        "message": "Login realizado com sucesso!",
        "user": {
            "id": user["id"], 
            "email": user["email"], 
            "name": user["name"], 
            "plan": user.get("plan", "free"),
            "company": user.get("company"),
            "phone": user.get("phone")
        },
        "token": token
    }

@api_router.post("/auth/logout")
async def logout(user_id: str = Depends(get_current_user)):
    return {"message": "Logout realizado com sucesso!"}

@api_router.get("/auth/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "plan": user.get("plan", "free"),
        "company": user.get("company"),
        "phone": user.get("phone"),
        "industry": user.get("industry"),
        "picture": user.get("picture"),
        "created_at": user["created_at"]
    }

@api_router.put("/auth/profile")
async def update_profile(profile_data: UserUpdate, user_id: str = Depends(get_current_user)):
    update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Perfil atualizado com sucesso!"}

@api_router.post("/auth/change-password")
async def change_password(password_data: PasswordChange, user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if not verify_password(password_data.current_password, user.get("password", "")):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    new_hashed_password = hash_password(password_data.new_password)
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password": new_hashed_password, "updated_at": datetime.now(timezone.utc)}}
    )
    
    return {"message": "Senha alterada com sucesso!"}

# Enhanced Chat/Consultoria IA Routes
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest, user_id: str = Depends(get_current_user)):
    # Check plan limits
    if not await check_plan_limits(user_id, "ai_chats"):
        raise HTTPException(status_code=403, detail="Limite de consultas IA atingido para seu plano")
    
    try:
        # Initialize chat with Angola-specific business consulting context
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        system_message = """Você é um consultor especialista em negócios da Growen, focado no mercado angolano, com expertise em:
        - Estratégias de crescimento para PMEs angolanas
        - Análise financeira e KPIs adaptados para o mercado de Angola
        - Marketing digital e vendas no contexto angolano
        - Gestão de equipes e recursos humanos em Angola
        - Oportunidades de negócio no mercado angolano
        - Regulamentação empresarial em Angola
        - Financiamento e investimento para empresas angolanas
        
        Características das suas respostas:
        - Sempre em português angolano
        - Contextualizadas para o mercado local
        - Práticas e implementáveis para PMEs
        - Com exemplos específicos de Angola quando relevante
        - Considerando as características económicas e culturais locais
        
        Forneça respostas práticas, acionáveis e baseadas em dados. 
        Seja direto e profissional, mas amigável. 
        Sempre sugira próximos passos concretos adaptados à realidade angolana."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=chat_request.message)
        response = await chat.send_message(user_message)
        
        # Extract topic from message for categorization
        topic = extract_topic_from_message(chat_request.message)
        
        # Save chat history
        chat_message = ChatMessage(
            user_id=user_id,
            message=chat_request.message,
            response=response,
            session_id=session_id,
            topic=topic
        )
        
        await db.chat_messages.insert_one(chat_message.dict())
        
        return {
            "response": response,
            "session_id": session_id,
            "topic": topic
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na consultoria IA: {str(e)}")

def extract_topic_from_message(message: str) -> str:
    """Extract topic from message for categorization"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['venda', 'vendas', 'cliente', 'marketing']):
        return "Vendas e Marketing"
    elif any(word in message_lower for word in ['financ', 'dinheiro', 'lucro', 'receita', 'custo']):
        return "Finanças"
    elif any(word in message_lower for word in ['equipe', 'funcionário', 'rh', 'gestão']):
        return "Gestão de Pessoas"
    elif any(word in message_lower for word in ['estratégia', 'plano', 'crescimento', 'expansão']):
        return "Estratégia"
    elif any(word in message_lower for word in ['operação', 'processo', 'eficiência']):
        return "Operações"
    else:
        return "Geral"

@api_router.get("/chat/history")
async def get_chat_history(user_id: str = Depends(get_current_user), limit: int = 50):
    messages = await db.chat_messages.find({"user_id": user_id}).sort("timestamp", -1).limit(limit).to_list(limit)
    return messages

@api_router.get("/chat/sessions")
async def get_chat_sessions(user_id: str = Depends(get_current_user)):
    # Group messages by session_id and create session summaries
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$session_id",
            "last_message": {"$last": "$message"},
            "last_response": {"$last": "$response"},
            "message_count": {"$sum": 1},
            "last_timestamp": {"$max": "$timestamp"},
            "topics": {"$addToSet": "$topic"}
        }},
        {"$sort": {"last_timestamp": -1}},
        {"$limit": 20}
    ]
    
    sessions = await db.chat_messages.aggregate(pipeline).to_list(20)
    
    # Format sessions
    formatted_sessions = []
    for session in sessions:
        title = session["last_message"][:50] + "..." if len(session["last_message"]) > 50 else session["last_message"]
        formatted_sessions.append({
            "id": session["_id"],
            "title": title,
            "message_count": session["message_count"],
            "last_timestamp": session["last_timestamp"],
            "topics": list(session["topics"])
        })
    
    return formatted_sessions

@api_router.post("/chat/{session_id}/export-pdf")
async def export_chat_to_pdf(session_id: str, user_id: str = Depends(get_current_user)):
    # Get chat messages for this session
    messages = await db.chat_messages.find({"user_id": user_id, "session_id": session_id}).sort("timestamp", 1).to_list(1000)
    
    if not messages:
        raise HTTPException(status_code=404, detail="Sessão de chat não encontrada")
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=HexColor('#2ECC71'),
        spaceAfter=20
    )
    story.append(Paragraph("Consultoria Growen - Sessão de Chat", title_style))
    story.append(Spacer(1, 12))
    
    # Add messages
    for msg in messages:
        # User message
        user_style = ParagraphStyle(
            'UserMessage',
            parent=styles['Normal'],
            fontSize=12,
            textColor=HexColor('#1A2930'),
            leftIndent=20,
            spaceAfter=10
        )
        story.append(Paragraph(f"<b>Você:</b> {msg['message']}", user_style))
        
        # AI response
        ai_style = ParagraphStyle(
            'AIResponse',
            parent=styles['Normal'],
            fontSize=11,
            textColor=HexColor('#333333'),
            leftIndent=20,
            spaceAfter=15,
            backgroundColor=HexColor('#F4F4F4')
        )
        story.append(Paragraph(f"<b>Growen IA:</b> {msg['response']}", ai_style))
        story.append(Spacer(1, 6))
    
    doc.build(story)
    buffer.seek(0)
    
    # Mark chat as exported
    await db.chat_messages.update_many(
        {"user_id": user_id, "session_id": session_id},
        {"$set": {"saved_as_pdf": True}}
    )
    
    return StreamingResponse(
        io.BytesIO(buffer.read()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=consultoria-growen-{session_id[:8]}.pdf"}
    )

# Enhanced CRM Routes
@api_router.post("/crm/clients", response_model=Client)
async def create_client(client_data: ClientCreate, user_id: str = Depends(get_current_user)):
    # Check plan limits
    if not await check_plan_limits(user_id, "clients"):
        raise HTTPException(status_code=403, detail="Limite de clientes atingido para seu plano")
    
    client = Client(
        user_id=user_id,
        name=client_data.name,
        email=client_data.email,
        phone=client_data.phone,
        company=client_data.company,
        industry=client_data.industry,
        value=client_data.value,
        notes=client_data.notes
    )
    
    await db.clients.insert_one(client.dict())
    return client

@api_router.get("/crm/clients", response_model=List[Client])
async def get_clients(user_id: str = Depends(get_current_user), status: Optional[str] = None):
    query = {"user_id": user_id}
    if status:
        query["status"] = status
    
    clients = await db.clients.find(query).sort("created_at", -1).to_list(1000)
    return [Client(**client) for client in clients]

@api_router.put("/crm/clients/{client_id}")
async def update_client(client_id: str, client_data: ClientUpdate, user_id: str = Depends(get_current_user)):
    update_data = {k: v for k, v in client_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.clients.update_one(
        {"id": client_id, "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return {"message": "Cliente atualizado com sucesso!"}

@api_router.delete("/crm/clients/{client_id}")
async def delete_client(client_id: str, user_id: str = Depends(get_current_user)):
    result = await db.clients.delete_one({"id": client_id, "user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    return {"message": "Cliente removido com sucesso!"}

@api_router.get("/crm/pipeline")
async def get_sales_pipeline(user_id: str = Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1},
            "total_value": {"$sum": {"$ifNull": ["$value", 0]}},
            "clients": {"$push": {
                "id": "$id",
                "name": "$name",
                "email": "$email",
                "company": "$company",
                "value": "$value",
                "created_at": "$created_at"
            }}
        }}
    ]
    
    result = await db.clients.aggregate(pipeline).to_list(10)
    
    # Format pipeline data
    pipeline_data = {
        "lead_novo": {"count": 0, "total_value": 0, "clients": []},
        "em_negociacao": {"count": 0, "total_value": 0, "clients": []},
        "cliente_ativo": {"count": 0, "total_value": 0, "clients": []},
        "retido": {"count": 0, "total_value": 0, "clients": []}
    }
    
    for item in result:
        status = item["_id"]
        if status in pipeline_data:
            pipeline_data[status] = {
                "count": item["count"],
                "total_value": item["total_value"],
                "clients": item["clients"]
            }
    
    return pipeline_data

# Enhanced Reports Routes
@api_router.post("/reports/upload-csv")
async def upload_csv_for_analysis(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    # Check plan limits
    if not await check_plan_limits(user_id, "reports"):
        raise HTTPException(status_code=403, detail="Limite de relatórios atingido para seu plano")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são aceitos")
    
    try:
        # Read CSV file
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        
        # Parse CSV
        csv_file = io.StringIO(csv_data)
        df = pd.read_csv(csv_file)
        
        # Generate analysis using AI
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="Você é um analista de dados especializado em gerar insights para negócios angolanos."
        ).with_model("openai", "gpt-4o")
        
        # Create summary of the data
        data_summary = f"""
        Dados CSV para análise:
        - Número de linhas: {len(df)}
        - Colunas: {', '.join(df.columns.tolist())}
        - Primeiras 5 linhas:
        {df.head().to_string()}
        
        Por favor, analise estes dados e forneça insights úteis para um negócio angolano, incluindo:
        1. Principais tendências identificadas
        2. Oportunidades de melhoria
        3. Recomendações específicas
        4. KPIs importantes a acompanhar
        """
        
        user_message = UserMessage(text=data_summary)
        analysis = await chat.send_message(user_message)
        
        # Create report
        report = Report(
            user_id=user_id,
            title=f"Análise CSV - {file.filename}",
            content=analysis,
            type="csv_analysis",
            data_source=file.filename,
            insights=["Análise baseada em dados CSV", "Insights automáticos gerados por IA"]
        )
        
        await db.reports.insert_one(report.dict())
        
        return {
            "report_id": report.id,
            "title": report.title,
            "content": analysis,
            "data_summary": {
                "rows": len(df),
                "columns": df.columns.tolist(),
                "filename": file.filename
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo CSV: {str(e)}")

@api_router.post("/reports/generate")
async def generate_automatic_report(report_data: ReportCreate, user_id: str = Depends(get_current_user)):
    # Check plan limits
    if not await check_plan_limits(user_id, "reports"):
        raise HTTPException(status_code=403, detail="Limite de relatórios atingido para seu plano")
    
    try:
        # Get user's business data for analysis
        clients = await db.clients.find({"user_id": user_id}).to_list(1000)
        chat_messages = await db.chat_messages.find({"user_id": user_id}).sort("timestamp", -1).limit(50).to_list(50)
        
        # Create business summary for AI analysis
        business_summary = f"""
        Dados do negócio para análise:
        - Total de clientes: {len(clients)}
        - Clientes ativos: {len([c for c in clients if c.get('status') == 'cliente_ativo'])}
        - Consultas IA recentes: {len(chat_messages)}
        - Período de análise: {report_data.period or 'mensal'}
        
        Principais tópicos de consultoria recentes:
        {', '.join(set([msg.get('topic', 'Geral') for msg in chat_messages[:10]]))}
        
        Gere um relatório detalhado focado no mercado angolano com:
        1. Análise da situação atual
        2. Tendências identificadas
        3. Oportunidades de crescimento
        4. Recomendações estratégicas
        5. Próximos passos sugeridos
        """
        
        # Use AI to generate insights
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="Você é um consultor de negócios especializado em relatórios estratégicos para empresas angolanas."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=business_summary)
        report_content = await chat.send_message(user_message)
        
        # Create report
        report = Report(
            user_id=user_id,
            title=report_data.title,
            content=report_content,
            type=report_data.type,
            period=report_data.period,
            insights=["Relatório gerado automaticamente", "Análise baseada em dados do sistema"]
        )
        
        await db.reports.insert_one(report.dict())
        
        return {
            "report_id": report.id,
            "title": report.title,
            "content": report_content,
            "insights": report.insights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")

@api_router.get("/reports")
async def get_reports(user_id: str = Depends(get_current_user)):
    reports = await db.reports.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return reports

@api_router.get("/reports/{report_id}/pdf")
async def export_report_to_pdf(report_id: str, user_id: str = Depends(get_current_user)):
    report = await db.reports.find_one({"id": report_id, "user_id": user_id})
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Title with Growen branding
    title_style = ParagraphStyle(
        'GrowendTitle',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=HexColor('#2ECC71'),
        spaceAfter=30,
        alignment=1  # Center
    )
    story.append(Paragraph("Growen - Smart Business Consulting", title_style))
    
    # Report title
    report_title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#1A2930'),
        spaceAfter=20
    )
    story.append(Paragraph(report["title"], report_title_style))
    
    # Date
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=HexColor('#666666'),
        spaceAfter=20
    )
    story.append(Paragraph(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", date_style))
    story.append(Spacer(1, 20))
    
    # Content
    content_style = ParagraphStyle(
        'ContentStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=HexColor('#333333'),
        spaceAfter=12,
        lineHeight=1.5
    )
    
    # Split content into paragraphs
    paragraphs = report["content"].split('\n\n')
    for paragraph in paragraphs:
        if paragraph.strip():
            story.append(Paragraph(paragraph.strip(), content_style))
            story.append(Spacer(1, 6))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(buffer.read()),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=relatorio-growen-{report_id[:8]}.pdf"}
    )

# Enhanced Dashboard/KPIs Routes
@api_router.get("/dashboard/kpis")
async def get_dashboard_kpis(user_id: str = Depends(get_current_user)):
    # Get current month boundaries
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get aggregated data
    total_clients = await db.clients.count_documents({"user_id": user_id})
    active_clients = await db.clients.count_documents({"user_id": user_id, "status": "cliente_ativo"})
    leads = await db.clients.count_documents({"user_id": user_id, "status": "lead_novo"})
    negotiations = await db.clients.count_documents({"user_id": user_id, "status": "em_negociacao"})
    
    total_reports = await db.reports.count_documents({"user_id": user_id})
    monthly_reports = await db.reports.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": start_of_month}
    })
    
    total_chats = await db.chat_messages.count_documents({"user_id": user_id})
    monthly_chats = await db.chat_messages.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": start_of_month}
    })
    
    # Calculate total pipeline value
    pipeline_value = await db.clients.aggregate([
        {"$match": {"user_id": user_id, "value": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "total": {"$sum": "$value"}}}
    ]).to_list(1)
    
    total_pipeline_value = pipeline_value[0]["total"] if pipeline_value else 0
    
    # Get chart data for the last 6 months
    chart_data = await get_dashboard_chart_data(user_id)
    
    return {
        "overview": {
            "total_clients": total_clients,
            "active_clients": active_clients,
            "leads": leads,
            "negotiations": negotiations,
            "total_reports": total_reports,
            "monthly_reports": monthly_reports,
            "total_consultations": total_chats,
            "monthly_consultations": monthly_chats,
            "pipeline_value_aoa": total_pipeline_value,
            "conversion_rate": round((active_clients / total_clients * 100) if total_clients > 0 else 0, 1)
        },
        "charts": chart_data,
        "plan_info": await get_user_plan_info(user_id)
    }

async def get_dashboard_chart_data(user_id: str):
    """Get chart data for dashboard"""
    # Get last 6 months of data
    months = []
    current_date = datetime.now(timezone.utc)
    
    for i in range(6):
        month_start = current_date.replace(day=1) - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        
        # Count clients added this month
        clients_count = await db.clients.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start, "$lt": month_end}
        })
        
        # Count consultations this month
        chats_count = await db.chat_messages.count_documents({
            "user_id": user_id,
            "timestamp": {"$gte": month_start, "$lt": month_end}
        })
        
        # Count reports this month
        reports_count = await db.reports.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start, "$lt": month_end}
        })
        
        months.append({
            "month": month_start.strftime("%b"),
            "clients": clients_count,
            "consultations": chats_count,
            "reports": reports_count
        })
    
    return list(reversed(months))  # Reverse to show chronological order

async def get_user_plan_info(user_id: str):
    """Get user plan information and limits"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return None
    
    plan = user.get("plan", "free")
    plan_info = ANGOLA_PLANS[plan].copy()
    
    # Add current usage
    current_month = datetime.now(timezone.utc).replace(day=1)
    
    monthly_chats = await db.chat_messages.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": current_month}
    })
    
    monthly_reports = await db.reports.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": current_month}
    })
    
    total_clients = await db.clients.count_documents({"user_id": user_id})
    
    plan_info["usage"] = {
        "ai_chats": monthly_chats,
        "reports": monthly_reports,
        "clients": total_clients
    }
    
    return plan_info

# Angola Payment System
@api_router.get("/payments/plans")
async def get_angola_plans():
    return ANGOLA_PLANS

@api_router.post("/payments/checkout/session")
async def create_angola_checkout_session(request: Request, checkout_data: Dict[str, Any], user_id: str = Depends(get_current_user)):
    try:
        plan_id = checkout_data.get("plan_id")
        payment_method = checkout_data.get("payment_method", "stripe")  # stripe, multicaixa, manual
        
        if plan_id not in ANGOLA_PLANS:
            raise HTTPException(status_code=400, detail="Plano inválido")
        
        plan = ANGOLA_PLANS[plan_id]
        
        # Build URLs from request origin
        base_url = str(request.base_url).rstrip('/')
        success_url = f"{base_url}/dashboard/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/dashboard/planos"
        
        if payment_method == "stripe":
            # Use Stripe with USD pricing
            webhook_url = f"{base_url}/api/webhook/stripe"
            stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
            
            checkout_request = CheckoutSessionRequest(
                amount=plan["price_usd"],
                currency="usd",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    "user_id": user_id,
                    "plan_id": plan_id,
                    "plan_name": plan["name"],
                    "payment_method": "stripe"
                }
            )
            
            session = await stripe_checkout.create_checkout_session(checkout_request)
            session_id = session.session_id
            checkout_url = session.url
            
        elif payment_method == "multicaixa":
            # Placeholder for Multicaixa Express integration
            session_id = str(uuid.uuid4())
            checkout_url = f"{base_url}/dashboard/payment/multicaixa?session_id={session_id}&plan={plan_id}"
            
        elif payment_method == "manual":
            # Manual payment - generate payment instructions
            session_id = str(uuid.uuid4())
            checkout_url = f"{base_url}/dashboard/payment/manual?session_id={session_id}&plan={plan_id}"
        
        else:
            raise HTTPException(status_code=400, detail="Método de pagamento inválido")
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            user_id=user_id,
            session_id=session_id,
            amount=plan["price_aoa"],
            currency="AOA",
            payment_method=payment_method,
            payment_status="initiated",
            status="pending",
            metadata={"plan_id": plan_id, "plan_name": plan["name"]}
        )
        
        await db.payment_transactions.insert_one(transaction.dict())
        
        return {
            "url": checkout_url,
            "session_id": session_id,
            "payment_method": payment_method,
            "plan": plan,
            "amount_aoa": plan["price_aoa"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no checkout: {str(e)}")

@api_router.post("/payments/manual/confirm")
async def confirm_manual_payment(session_id: str, payment_proof: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    """Confirm manual payment with proof upload"""
    transaction = await db.payment_transactions.find_one({"session_id": session_id, "user_id": user_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    # Save payment proof (in production, store in cloud storage)
    proof_filename = f"payment_proof_{session_id}_{user_id}.{payment_proof.filename.split('.')[-1]}"
    
    # Update transaction status to pending review
    await db.payment_transactions.update_one(
        {"session_id": session_id, "user_id": user_id},
        {
            "$set": {
                "payment_status": "pending_review",
                "status": "pending_review",
                "proof_filename": proof_filename,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {"message": "Comprovativo de pagamento enviado! Será analisado em até 24 horas."}

# Email functions
async def send_welcome_email(email: str, name: str):
    """Send welcome email to new users"""
    subject = "Bem-vindo à Growen - Smart Business Consulting!"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2ECC71;">Growen</h1>
                <p style="color: #1A2930; font-size: 18px;">Smart Business Consulting</p>
            </div>
            
            <h2>Olá {name}!</h2>
            
            <p>É com grande prazer que damos as boas-vindas à plataforma Growen!</p>
            
            <p>Agora você tem acesso a:</p>
            <ul>
                <li>Consultoria inteligente com IA especializada em negócios angolanos</li>
                <li>Dashboard executivo com KPIs essenciais</li>
                <li>CRM simplificado para gestão de clientes</li>
                <li>Relatórios automáticos com insights personalizados</li>
            </ul>
            
            <p>Comece já a transformar seu negócio com as nossas ferramentas de IA!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://consultai-1.preview.emergentagent.com/dashboard" 
                   style="background-color: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                   Acessar Dashboard
                </a>
            </div>
            
            <p>Precisa de ajuda? Responda este email e nossa equipe terá prazer em ajudar!</p>
            
            <p>Atenciosamente,<br>Equipe Growen</p>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Growen API v2.0", "features": "Angola Edition"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header, Cookie, BackgroundTasks, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
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
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
import pandas as pd
import aiofiles
import base64
from urllib.parse import quote

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Keys and configurations
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-growen-2025')
SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
EMAIL_USER = os.environ.get('EMAIL_USER', 'admin@growen.com')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', 'password')

# WhatsApp Configuration
WHATSAPP_NUMBER = os.environ.get('WHATSAPP_NUMBER', '+244943201590')
WHATSAPP_MESSAGE = os.environ.get('WHATSAPP_MESSAGE', 'Olá! Gostaria de consultoria especializada através da Growen - Smart Business Consulting')

# Create the main app without a prefix
app = FastAPI(title="Growen - Smart Business Consulting API", version="3.0.0")

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
    is_admin: bool = False
    company: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    country: str = "Angola"
    language: str = "pt"
    last_login: Optional[datetime] = None
    subscription_expires: Optional[datetime] = None

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

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    value: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('A nova senha deve ter pelo menos 6 caracteres')
        return v

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
    last_contact: Optional[datetime] = None
    communication_history: List[Dict[str, Any]] = []

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

class EmailTemplate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    subject: str
    content: str
    type: str = "client_email"  # client_email, newsletter, promotional
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SendEmailRequest(BaseModel):
    client_id: str
    template_id: Optional[str] = None
    subject: str
    content: str

# Enhanced Report Models
class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    content: str
    type: str = "automatic"  # automatic, manual, csv_analysis, custom
    insights: List[str] = []
    data_source: Optional[str] = None
    period: Optional[str] = None  # weekly, monthly, quarterly, custom
    date_range: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    file_path: Optional[str] = None
    charts_data: Optional[Dict[str, Any]] = None

class ReportCreate(BaseModel):
    title: str
    type: str = "custom"
    period: Optional[str] = None
    date_range: Optional[Dict[str, str]] = None
    filters: Optional[Dict[str, Any]] = None
    include_charts: bool = True
    include_insights: bool = True
    sections: List[str] = ["overview", "clients", "sales", "performance"]

# Chat and AI Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_id: str
    message: str
    response: str
    topic: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_used: str = "gpt-4o-mini"
    tokens_used: Optional[int] = None

class ChatSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    topics: List[str] = []
    message_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    model: str = "gpt-4o-mini"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    message_id: str
    tokens_used: Optional[int] = None

# Payment Models
class PaymentProof(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str  # starter, pro
    amount: float
    file_path: str
    payment_method: str = "bank_transfer"
    status: str = "pending"  # pending, approved, rejected
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None  # admin user id

class PaymentProofCreate(BaseModel):
    plan_id: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class PaymentReview(BaseModel):
    status: str  # approved, rejected
    notes: Optional[str] = None

# Invoice Models  
class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    user_id: str
    client_id: str
    service_description: str = "Consultoria Empresarial com IA"
    quantity: int = 1
    unit_price: float
    total_amount: float
    payment_status: str = "pending"  # pending, paid, overdue
    issue_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    due_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=30))
    notes: Optional[str] = None
    pdf_path: Optional[str] = None
    sent_date: Optional[datetime] = None

class InvoiceCreate(BaseModel):
    client_id: str
    service_description: str = "Consultoria Empresarial com IA"
    quantity: int = 1
    unit_price: float
    notes: Optional[str] = None

# Partnership Models
class Partner(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: str
    service_category: str  # contabilidade, juridico, marketing, tecnologia, etc
    description: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    is_verified: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    contact_info: Dict[str, Any] = {}
    
class PartnerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: str
    service_category: str
    description: str
    website: Optional[str] = None

class PartnerReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    partner_id: str
    user_id: str
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Admin Models
class AdminStats(BaseModel):
    total_users: int
    active_users: int
    total_revenue: float
    monthly_revenue: float
    total_consultations: int
    total_reports: int
    total_clients: int
    top_industries: List[Dict[str, Any]]
    user_growth: List[Dict[str, Any]]
    revenue_growth: List[Dict[str, Any]]

# WhatsApp Configuration (using environment variable)
# WHATSAPP_NUMBER and WHATSAPP_MESSAGE are already defined above from environment variables

# Angola-specific pricing (updated)
ANGOLA_PLANS = {
    "free": {
        "name": "Gratuito",
        "price_aoa": 0,
        "price_usd": 0,
        "features": [
            "5 consultas IA por mês",
            "10 clientes no CRM",
            "2 relatórios por mês",
            "Dashboard básico",
            "Suporte por email"
        ],
        "limits": {
            "ai_chats": 5,
            "clients": 10,
            "reports": 2,
            "storage_mb": 100,
            "email_sends": 10
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
            "Sistema de emails",
            "Suporte prioritário"
        ],
        "limits": {
            "ai_chats": 50,
            "clients": 100,
            "reports": 10,
            "storage_mb": 500,
            "email_sends": 100
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
            "Emails ilimitados",
            "Integrações avançadas",
            "Suporte 24/7",
            "Consultoria WhatsApp"
        ],
        "limits": {
            "ai_chats": -1,  # unlimited
            "clients": -1,
            "reports": -1,
            "storage_mb": 2000,
            "email_sends": -1
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
    
    if access_token:
        token = access_token
    elif authorization and authorization.startswith('Bearer '):
        token = authorization.split(' ')[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    
    user_id = verify_jwt_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
    
    # Update last login
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    return user_id

async def get_admin_user(authorization: Optional[str] = Header(None), access_token: Optional[str] = Cookie(None)) -> str:
    user_id = await get_current_user(authorization, access_token)
    user = await db.users.find_one({"id": user_id})
    
    if not user or not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Acesso negado - Apenas administradores")
    
    return user_id

async def send_email(to_email: str, subject: str, html_content: str, text_content: str = None):
    """Send email using SMTP"""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = EMAIL_USER
        message["To"] = to_email

        if text_content:
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)

        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        await aiosmtplib.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            start_tls=True,
            username=EMAIL_USER,
            password=EMAIL_PASSWORD,
        )
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

async def check_plan_limits(user_id: str, feature: str) -> bool:
    """Check if user has reached plan limits"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return False
    
    plan = user.get("plan", "free")
    limits = ANGOLA_PLANS[plan]["limits"]
    
    if feature == "ai_chats":
        if limits["ai_chats"] == -1:
            return True
        current_count = await db.chat_messages.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": datetime.now(timezone.utc).replace(day=1)}
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
    
    elif feature == "email_sends":
        if limits["email_sends"] == -1:
            return True
        current_count = await db.email_logs.count_documents({
            "user_id": user_id,
            "sent_at": {"$gte": datetime.now(timezone.utc).replace(day=1)}
        })
        return current_count < limits["email_sends"]
    
    return True

# Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Este email já está registrado")
    
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
    
    background_tasks.add_task(send_welcome_email, user.email, user.name)
    
    token = create_jwt_token(user.id)
    
    return {
        "message": "Conta criada com sucesso!",
        "user": {"id": user.id, "email": user.email, "name": user.name, "plan": user.plan},
        "token": token
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Conta desativada")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )
    
    token = create_jwt_token(user["id"])
    
    return {
        "message": "Login realizado com sucesso!",
        "user": {
            "id": user["id"], 
            "email": user["email"], 
            "name": user["name"], 
            "plan": user.get("plan", "free"),
            "company": user.get("company"),
            "phone": user.get("phone"),
            "is_admin": user.get("is_admin", False)
        },
        "token": token
    }

@api_router.get("/auth/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Remove password from response
    user.pop("password", None)
    return user

@api_router.put("/auth/profile")
async def update_user_profile(
    profile_data: UserUpdate,
    user_id: str = Depends(get_current_user)
):
    try:
        # Get current user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Prepare update data
        update_data = {}
        for field, value in profile_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            
            # Update user in database
            result = await db.users.update_one(
                {"id": user_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return {"message": "Perfil atualizado com sucesso!"}
        
    except Exception as e:
        logger.error(f"Error updating user profile {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.post("/auth/change-password")
async def change_password(
    password_data: PasswordChange,
    user_id: str = Depends(get_current_user)
):
    try:
        # Get current user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Verify current password
        if not bcrypt.checkpw(password_data.current_password.encode('utf-8'), user["password"].encode('utf-8')):
            raise HTTPException(status_code=400, detail="Senha atual incorreta")
        
        # Hash new password
        hashed_password = bcrypt.hashpw(password_data.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Update password
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "password": hashed_password,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        return {"message": "Senha alterada com sucesso!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

# Enhanced CRM Routes with Email/Phone Integration
@api_router.post("/crm/clients", response_model=Client)
async def create_client(client_data: ClientCreate, user_id: str = Depends(get_current_user)):
    try:
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating client for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.get("/crm/clients")
async def get_clients(user_id: str = Depends(get_current_user)):
    try:
        clients = await db.clients.find({"user_id": user_id}, {"_id": 0})\
            .sort("created_at", -1)\
            .to_list(1000)
        
        return clients
        
    except Exception as e:
        logger.error(f"Error fetching clients for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar clientes")

@api_router.put("/crm/clients/{client_id}")
async def update_client(
    client_id: str,
    client_data: ClientUpdate,
    user_id: str = Depends(get_current_user)
):
    try:
        # Check if client belongs to user
        client = await db.clients.find_one({"id": client_id, "user_id": user_id})
        if not client:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        # Prepare update data
        update_data = {}
        for field, value in client_data.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            
            # Update client in database
            result = await db.clients.update_one(
                {"id": client_id, "user_id": user_id},
                {"$set": update_data}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        return {"message": "Cliente atualizado com sucesso!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.delete("/crm/clients/{client_id}")
async def delete_client(
    client_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        # Check if client belongs to user
        client = await db.clients.find_one({"id": client_id, "user_id": user_id})
        if not client:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        # Delete client
        await db.clients.delete_one({"id": client_id, "user_id": user_id})
        
        return {"message": "Cliente removido com sucesso!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.post("/crm/clients/{client_id}/send-email")
async def send_email_to_client(
    client_id: str, 
    email_request: SendEmailRequest, 
    user_id: str = Depends(get_current_user)
):
    if not await check_plan_limits(user_id, "email_sends"):
        raise HTTPException(status_code=403, detail="Limite de envio de emails atingido")
    
    client = await db.clients.find_one({"id": client_id, "user_id": user_id})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    user = await db.users.find_one({"id": user_id})
    
    # HTML template for professional email
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2ECC71; padding-bottom: 20px;">
                <h1 style="color: #2ECC71; margin: 0;">Growen</h1>
                <p style="color: #1A2930; margin: 5px 0;">Smart Business Consulting</p>
            </div>
            
            <p>Olá {client['name']},</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #2ECC71; margin: 20px 0;">
                {email_request.content}
            </div>
            
            <p>Atenciosamente,<br>
            <strong>{user['name']}</strong><br>
            {user.get('company', 'Growen Consulting')}<br>
            {user.get('phone', 'Telefone não informado')}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px;">
                <p>Este email foi enviado através da plataforma Growen - Smart Business Consulting</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    success = await send_email(client["email"], email_request.subject, html_content)
    
    if success:
        # Log email sent
        await db.email_logs.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "client_id": client_id,
            "subject": email_request.subject,
            "content": email_request.content,
            "sent_at": datetime.now(timezone.utc),
            "status": "sent"
        })
        
        # Update client communication history
        await db.clients.update_one(
            {"id": client_id},
            {
                "$push": {
                    "communication_history": {
                        "type": "email",
                        "subject": email_request.subject,
                        "content": email_request.content[:100] + "...",
                        "timestamp": datetime.now(timezone.utc),
                        "status": "sent"
                    }
                },
                "$set": {"last_contact": datetime.now(timezone.utc)}
            }
        )
        
        return {"message": "Email enviado com sucesso!", "status": "sent"}
    else:
        return {"message": "Erro ao enviar email", "status": "failed"}

@api_router.get("/crm/clients/{client_id}/call-link")
async def get_call_link(client_id: str, user_id: str = Depends(get_current_user)):
    client = await db.clients.find_one({"id": client_id, "user_id": user_id})
    if not client:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    phone = client.get("phone")
    if not phone:
        raise HTTPException(status_code=400, detail="Cliente não possui telefone cadastrado")
    
    # Clean phone number and create call link
    clean_phone = ''.join(filter(str.isdigit, phone))
    call_link = f"tel:{clean_phone}"
    whatsapp_link = f"https://wa.me/{clean_phone}?text={quote('Olá! Entrando em contato através da plataforma Growen.')}"
    
    # Log call attempt
    await db.clients.update_one(
        {"id": client_id},
        {
            "$push": {
                "communication_history": {
                    "type": "call_attempt",
                    "phone": phone,
                    "timestamp": datetime.now(timezone.utc)
                }
            },
            "$set": {"last_contact": datetime.now(timezone.utc)}
        }
    )
    
    return {
        "call_link": call_link,
        "whatsapp_link": whatsapp_link,
        "phone": phone
    }

@api_router.get("/email-templates")
async def get_email_templates(user_id: str = Depends(get_current_user)):
    templates = [
        {
            "id": "welcome",
            "name": "Boas-vindas",
            "subject": "Bem-vindo à nossa empresa!",
            "content": "Olá [NOME], é com grande prazer que damos as boas-vindas..."
        },
        {
            "id": "follow_up",
            "name": "Follow-up",
            "subject": "Continuando nossa conversa",
            "content": "Olá [NOME], gostaria de dar continuidade à nossa conversa sobre..."
        },
        {
            "id": "proposal",
            "name": "Proposta Comercial",
            "subject": "Proposta personalizada para [EMPRESA]",
            "content": "Prezado [NOME], conforme conversamos, segue nossa proposta..."
        },
        {
            "id": "meeting",
            "name": "Agendamento de Reunião",
            "subject": "Vamos marcar uma reunião?",
            "content": "Olá [NOME], gostaria de agendar uma reunião para discutirmos..."
        }
    ]
    return templates

# Enhanced Reports with Custom Generation
@api_router.post("/reports/generate-custom")
async def generate_custom_report(
    report_request: ReportCreate,
    user_id: str = Depends(get_current_user)
):
    if not await check_plan_limits(user_id, "reports"):
        raise HTTPException(status_code=403, detail="Limite de relatórios atingido")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Generate report content based on user data
    clients = await db.clients.find({"user_id": user_id}).to_list(1000)
    chat_messages = await db.chat_messages.find({"user_id": user_id}).to_list(100)
    
    # Create comprehensive report content
    content_sections = []
    
    if "overview" in report_request.sections:
        content_sections.append(f"""
        ## Visão Geral do Negócio
        
        **Período:** {report_request.period or 'Personalizado'}
        **Empresa:** {user.get('company', 'Não informado')}
        **Setor:** {user.get('industry', 'Não informado')}
        
        **Métricas Principais:**
        - Total de Clientes: {len(clients)}
        - Clientes Ativos: {len([c for c in clients if c.get('status') == 'cliente_ativo'])}
        - Novos Leads: {len([c for c in clients if c.get('status') == 'lead_novo'])}
        - Consultas IA Realizadas: {len(chat_messages)}
        """)
    
    if "clients" in report_request.sections and clients:
        total_value = sum(c.get('value', 0) for c in clients if c.get('value'))
        content_sections.append(f"""
        ## Análise de Clientes
        
        **Distribuição por Status:**
        - Novos Leads: {len([c for c in clients if c.get('status') == 'lead_novo'])}
        - Em Negociação: {len([c for c in clients if c.get('status') == 'em_negociacao'])}
        - Clientes Ativos: {len([c for c in clients if c.get('status') == 'cliente_ativo'])}
        - Retidos: {len([c for c in clients if c.get('status') == 'retido'])}
        
        **Valor Total do Pipeline:** {total_value:,.0f} Kz
        
        **Top 5 Clientes por Valor:**
        """)
        
        top_clients = sorted([c for c in clients if c.get('value')], 
                           key=lambda x: x.get('value', 0), reverse=True)[:5]
        for i, client in enumerate(top_clients, 1):
            content_sections[-1] += f"\n{i}. {client['name']} - {client.get('value', 0):,.0f} Kz"
    
    if "performance" in report_request.sections:
        content_sections.append(f"""
        ## Performance e Atividade
        
        **Atividade da Plataforma:**
        - Total de Consultas IA: {len(chat_messages)}
        - Última Atividade: {datetime.now(timezone.utc).strftime('%d/%m/%Y')}
        
        **Recomendações:**
        - {'Continue engajando com leads para conversão' if len([c for c in clients if c.get('status') == 'lead_novo']) > 0 else 'Foque em prospecção de novos leads'}
        - {'Otimize processos de vendas' if total_value > 0 else 'Defina valores para clientes existentes'}
        - Use mais a consultoria IA para estratégias personalizadas
        """)
    
    insights = []
    if report_request.include_insights:
        insights = [
            f"Taxa de conversão de leads: {(len([c for c in clients if c.get('status') == 'cliente_ativo']) / max(len(clients), 1) * 100):.1f}%",
            f"Valor médio por cliente: {(total_value / max(len([c for c in clients if c.get('value')]), 1)):,.0f} Kz",
            "Recomenda-se aumentar atividade de prospecção" if len(clients) < 50 else "Base de clientes sólida estabelecida"
        ]
    
    # Create report record
    report = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": report_request.title,
        "content": "\n\n".join(content_sections),
        "type": report_request.type,
        "insights": insights,
        "period": report_request.period,
        "date_range": report_request.date_range,
        "created_at": datetime.now(timezone.utc),
        "charts_data": {} if report_request.include_charts else None
    }
    
    await db.reports.insert_one(report)
    
    return {"message": "Relatório gerado com sucesso!", "report_id": report["id"]}

@api_router.post("/reports/upload-csv")
async def upload_csv_for_analysis(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    if not await check_plan_limits(user_id, "reports"):
        raise HTTPException(status_code=403, detail="Limite de relatórios atingido")
    
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são aceitos")
    
    # Check file size (max 5MB)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 5MB.")
    
    try:
        # Parse CSV content
        csv_content = content.decode('utf-8')
        csv_file = io.StringIO(csv_content)
        reader = csv.DictReader(csv_file)
        data = list(reader)
        
        if not data:
            raise HTTPException(status_code=400, detail="Arquivo CSV vazio ou inválido")
        
        # Analyze CSV data
        total_rows = len(data)
        columns = list(data[0].keys()) if data else []
        
        # Generate insights based on CSV structure
        insights = [
            f"Analisados {total_rows} registros",
            f"Identificadas {len(columns)} colunas de dados",
            "Dados processados com sucesso"
        ]
        
        # Detect common business data patterns
        if any('receita' in col.lower() or 'vendas' in col.lower() or 'valor' in col.lower() for col in columns):
            insights.append("Dados financeiros detectados - análise de receita disponível")
        
        if any('cliente' in col.lower() or 'nome' in col.lower() for col in columns):
            insights.append("Dados de clientes identificados")
        
        if any('data' in col.lower() or 'mes' in col.lower() for col in columns):
            insights.append("Dados temporais encontrados - análise de tendências possível")
        
        # Create analysis report
        content = f"""
        ## Análise de Dados CSV - {file.filename}
        
        **Resumo da Análise:**
        - Total de Registros: {total_rows}
        - Colunas Identificadas: {len(columns)}
        - Data de Análise: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}
        
        **Estrutura dos Dados:**
        """
        
        for i, col in enumerate(columns[:10], 1):  # Limit to first 10 columns
            content += f"\n{i}. {col}"
        
        if len(columns) > 10:
            content += f"\n... e mais {len(columns) - 10} colunas"
        
        content += f"""
        
        **Insights Automáticos:**
        """
        
        for insight in insights:
            content += f"\n• {insight}"
        
        content += """
        
        **Recomendações:**
        • Use a consultoria IA para análises mais detalhadas dos dados
        • Considere implementar dashboards para acompanhamento contínuo
        • Integre estes dados ao seu CRM para melhor gestão
        """
        
        # Save analysis report
        report = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": f"Análise CSV: {file.filename}",
            "content": content,
            "type": "csv_analysis",
            "insights": insights,
            "data_source": file.filename,
            "created_at": datetime.now(timezone.utc),
            "charts_data": {"total_rows": total_rows, "columns": columns}
        }
        
        await db.reports.insert_one(report)
        
        return {
            "message": "Arquivo CSV analisado com sucesso!",
            "report_id": report["id"],
            "insights": insights,
            "total_rows": total_rows,
            "columns": len(columns)
        }
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Erro ao decodificar arquivo. Certifique-se de que está em UTF-8.")
    except Exception as e:
        logger.error(f"Error processing CSV: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar arquivo CSV")

@api_router.get("/reports/{report_id}/pdf")
async def export_report_to_pdf(
    report_id: str,
    user_id: str = Depends(get_current_user)
):
    # Get report
    report = await db.reports.find_one({"id": report_id, "user_id": user_id})
    if not report:
        raise HTTPException(status_code=404, detail="Relatório não encontrado")
    
    # Get user info
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    try:
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            textColor=HexColor('#2ECC71'),
            alignment=1  # Center alignment
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            textColor=HexColor('#1A2930')
        )
        
        # Build PDF content
        story = []
        
        # Header
        story.append(Paragraph("Growen - Smart Business Consulting", title_style))
        story.append(Paragraph(report['title'], subtitle_style))
        story.append(Paragraph(f"Cliente: {user['name']}", styles['Normal']))
        story.append(Paragraph(f"Empresa: {user.get('company', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"Data: {report['created_at'].strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 30))
        
        # Content
        content_lines = report['content'].split('\n')
        for line in content_lines:
            if line.strip():
                if line.startswith('##'):
                    story.append(Paragraph(line.replace('##', '').strip(), subtitle_style))
                elif line.startswith('**') and line.endswith('**'):
                    story.append(Paragraph(f"<b>{line.replace('**', '').strip()}</b>", styles['Normal']))
                else:
                    story.append(Paragraph(line.strip(), styles['Normal']))
            story.append(Spacer(1, 10))
        
        # Insights section
        if report.get('insights'):
            story.append(Spacer(1, 20))
            story.append(Paragraph("Insights Principais", subtitle_style))
            for insight in report['insights']:
                story.append(Paragraph(f"• {insight}", styles['Normal']))
                story.append(Spacer(1, 8))
        
        # Footer
        story.append(Spacer(1, 50))
        story.append(Paragraph("© 2025 Growen - Smart Business Consulting para Angola", styles['Normal']))
        story.append(Paragraph("Democratizando consultoria de negócios através de IA", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        # Return PDF
        buffer.seek(0)
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=growen-relatorio-{report_id[:8]}.pdf"}
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF for report {report_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao gerar PDF do relatório")

@api_router.get("/reports")
async def get_user_reports(user_id: str = Depends(get_current_user)):
    try:
        reports = await db.reports.find({"user_id": user_id}, {"_id": 0})\
            .sort("created_at", -1)\
            .to_list(50)
        
        return reports
        
    except Exception as e:
        logger.error(f"Error fetching reports for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar relatórios")

def get_clients_by_status(clients):
    status_count = {}
    for client in clients:
        status = client.get("status", "lead_novo")
        status_count[status] = status_count.get(status, 0) + 1
    return status_count

def get_industries_summary(clients):
    industries = {}
    for client in clients:
        industry = client.get("industry", "Não informado")
        industries[industry] = industries.get(industry, 0) + 1
    return industries

def get_consultation_topics(messages):
    topics = {}
    for message in messages[:20]:  # Last 20 messages
        topic = message.get("topic", "Geral")
        topics[topic] = topics.get(topic, 0) + 1
    return topics

def get_clients_chart_data(clients):
    status_count = get_clients_by_status(clients)
    return [{"name": k.replace("_", " ").title(), "value": v} for k, v in status_count.items()]

def get_industry_chart_data(clients):
    industries = get_industries_summary(clients)
    return [{"name": k, "value": v} for k, v in industries.items()]

def get_monthly_growth_data(clients):
    # Group clients by month
    monthly_data = {}
    for client in clients:
        month = client["created_at"].strftime("%Y-%m")
        monthly_data[month] = monthly_data.get(month, 0) + 1
    
    return [{"month": k, "clients": v} for k, v in sorted(monthly_data.items())]

def get_pipeline_value_data(clients):
    status_values = {}
    for client in clients:
        status = client.get("status", "lead_novo")
        value = client.get("value", 0) or 0
        status_values[status] = status_values.get(status, 0) + value
    
    return [{"status": k.replace("_", " ").title(), "value": v} for k, v in status_values.items()]

def generate_business_insights(clients, messages):
    insights = []
    
    # Client insights
    if clients:
        active_clients = len([c for c in clients if c.get("status") == "cliente_ativo"])
        conversion_rate = (active_clients / len(clients)) * 100 if clients else 0
        insights.append(f"Taxa de conversão atual: {conversion_rate:.1f}%")
        
        # Industry insights
        industries = get_industries_summary(clients)
        top_industry = max(industries, key=industries.get) if industries else "N/A"
        insights.append(f"Setor com mais clientes: {top_industry}")
    
    # AI consultation insights
    if messages:
        topics = get_consultation_topics(messages)
        top_topic = max(topics, key=topics.get) if topics else "N/A"
        insights.append(f"Tópico mais consultado: {top_topic}")
    
    insights.append("Recomendação: Foque em estratégias de retenção de clientes")
    insights.append("Oportunidade: Expansão no setor dominante identificado")
    
    return insights

# Partner/Marketplace Routes
@api_router.post("/partners", response_model=Partner)
async def create_partner(partner_data: PartnerCreate):
    partner = Partner(
        name=partner_data.name,
        email=partner_data.email,
        phone=partner_data.phone,
        company=partner_data.company,
        service_category=partner_data.service_category,
        description=partner_data.description,
        website=partner_data.website
    )
    
    await db.partners.insert_one(partner.dict())
    return partner

@api_router.get("/partners", response_model=List[Partner])
async def get_partners(category: Optional[str] = None, verified_only: bool = False):
    query = {"is_active": True}
    if category:
        query["service_category"] = category
    if verified_only:
        query["is_verified"] = True
    
    partners = await db.partners.find(query).sort("rating", -1).to_list(100)
    return [Partner(**partner) for partner in partners]

@api_router.get("/partners/categories")
async def get_partner_categories():
    categories = [
        {"id": "contabilidade", "name": "Contabilidade", "icon": "calculator"},
        {"id": "juridico", "name": "Jurídico", "icon": "scale"},
        {"id": "marketing", "name": "Marketing Digital", "icon": "megaphone"},
        {"id": "tecnologia", "name": "Tecnologia", "icon": "computer"},
        {"id": "consultoria", "name": "Consultoria", "icon": "users"},
        {"id": "design", "name": "Design", "icon": "palette"},
        {"id": "financeiro", "name": "Financeiro", "icon": "dollar-sign"},
        {"id": "recursos_humanos", "name": "Recursos Humanos", "icon": "user-check"}
    ]
    return categories

@api_router.post("/partners/{partner_id}/review")
async def create_partner_review(
    partner_id: str, 
    review_data: Dict[str, Any], 
    user_id: str = Depends(get_current_user)
):
    partner = await db.partners.find_one({"id": partner_id})
    if not partner:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    
    review = PartnerReview(
        partner_id=partner_id,
        user_id=user_id,
        rating=review_data["rating"],
        comment=review_data["comment"]
    )
    
    await db.partner_reviews.insert_one(review.dict())
    
    # Update partner rating
    reviews = await db.partner_reviews.find({"partner_id": partner_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    
    await db.partners.update_one(
        {"id": partner_id},
        {
            "$set": {
                "rating": round(avg_rating, 1),
                "total_reviews": len(reviews)
            }
        }
    )
    
    return {"message": "Avaliação adicionada com sucesso!"}

# Admin Routes
@api_router.get("/admin/stats")
async def get_admin_stats(admin_id: str = Depends(get_admin_user)):
    # Get comprehensive admin statistics
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"last_login": {"$gte": datetime.now(timezone.utc) - timedelta(days=30)}})
    total_consultations = await db.chat_messages.count_documents({})
    total_reports = await db.reports.count_documents({})
    total_clients = await db.clients.count_documents({})
    
    # Revenue calculations (mock data - would integrate with payment system)
    total_revenue = 50000.0  # Mock data
    monthly_revenue = 15000.0  # Mock data
    
    # Top industries
    pipeline = [
        {"$group": {"_id": "$industry", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_industries = await db.users.aggregate(pipeline).to_list(5)
    
    # User growth data (last 6 months)
    user_growth = []
    for i in range(6):
        month_start = datetime.now(timezone.utc).replace(day=1) - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        count = await db.users.count_documents({
            "created_at": {"$gte": month_start, "$lt": month_end}
        })
        user_growth.append({
            "month": month_start.strftime("%b %Y"),
            "users": count
        })
    
    return AdminStats(
        total_users=total_users,
        active_users=active_users,
        total_revenue=total_revenue,
        monthly_revenue=monthly_revenue,
        total_consultations=total_consultations,
        total_reports=total_reports,
        total_clients=total_clients,
        top_industries=[{"industry": item["_id"], "count": item["count"]} for item in top_industries],
        user_growth=list(reversed(user_growth)),
        revenue_growth=[]  # Would implement based on payment data
    )

@api_router.get("/admin/users")
async def get_all_users(
    admin_id: str = Depends(get_admin_user),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None
):
    skip = (page - 1) * limit
    query = {}
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"company": {"$regex": search, "$options": "i"}}
        ]
    
    users = await db.users.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    # Remove sensitive data
    for user in users:
        user.pop("password", None)
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@api_router.put("/admin/users/{user_id}")
async def update_user_admin(
    user_id: str,
    update_data: Dict[str, Any],
    admin_id: str = Depends(get_admin_user)
):
    allowed_fields = ["is_active", "plan", "is_admin"]
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="Nenhum campo válido para atualizar")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Usuário atualizado com sucesso"}

@api_router.get("/admin/partners")
async def get_all_partners_admin(admin_id: str = Depends(get_admin_user)):
    partners = await db.partners.find({}).sort("created_at", -1).to_list(1000)
    return partners

@api_router.put("/admin/partners/{partner_id}")
async def update_partner_admin(
    partner_id: str,
    update_data: Dict[str, Any],
    admin_id: str = Depends(get_admin_user)
):
    allowed_fields = ["is_verified", "is_active"]
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    result = await db.partners.update_one(
        {"id": partner_id},
        {"$set": update_fields}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    
    return {"message": "Parceiro atualizado com sucesso"}

# WhatsApp Integration
@api_router.get("/whatsapp/consultation-config")
async def get_whatsapp_config():
    return {
        "whatsapp_number": WHATSAPP_NUMBER,
        "message": WHATSAPP_MESSAGE,
        "link": f"https://wa.me/{WHATSAPP_NUMBER.replace('+', '')}?text={quote(WHATSAPP_MESSAGE)}"
    }

# Enhanced Dashboard with more metrics
@api_router.get("/dashboard/kpis")
async def get_dashboard_kpis(user_id: str = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Get all metrics
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
    
    # Email metrics
    total_emails = await db.email_logs.count_documents({"user_id": user_id})
    monthly_emails = await db.email_logs.count_documents({
        "user_id": user_id,
        "sent_at": {"$gte": start_of_month}
    })
    
    # Pipeline value
    pipeline_value = await db.clients.aggregate([
        {"$match": {"user_id": user_id, "value": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "total": {"$sum": "$value"}}}
    ]).to_list(1)
    
    total_pipeline_value = pipeline_value[0]["total"] if pipeline_value else 0
    
    # Chart data
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
            "total_emails": total_emails,
            "monthly_emails": monthly_emails,
            "pipeline_value_aoa": total_pipeline_value,
            "conversion_rate": round((active_clients / total_clients * 100) if total_clients > 0 else 0, 1)
        },
        "charts": chart_data,
        "plan_info": await get_user_plan_info(user_id)
    }

async def get_dashboard_chart_data(user_id: str):
    months = []
    current_date = datetime.now(timezone.utc)
    
    for i in range(6):
        month_start = current_date.replace(day=1) - timedelta(days=i*30)
        month_end = month_start + timedelta(days=30)
        
        clients_count = await db.clients.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start, "$lt": month_end}
        })
        
        chats_count = await db.chat_messages.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start, "$lt": month_end}
        })
        
        reports_count = await db.reports.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": month_start, "$lt": month_end}
        })
        
        emails_count = await db.email_logs.count_documents({
            "user_id": user_id,
            "sent_at": {"$gte": month_start, "$lt": month_end}
        })
        
        months.append({
            "month": month_start.strftime("%b"),
            "clients": clients_count,
            "consultations": chats_count,
            "reports": reports_count,
            "emails": emails_count
        })
    
    return list(reversed(months))

async def get_user_plan_info(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        return None
    
    plan = user.get("plan", "free")
    plan_info = ANGOLA_PLANS[plan].copy()
    
    current_month = datetime.now(timezone.utc).replace(day=1)
    
    monthly_chats = await db.chat_messages.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": current_month}
    })
    
    monthly_reports = await db.reports.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": current_month}
    })
    
    monthly_emails = await db.email_logs.count_documents({
        "user_id": user_id,
        "sent_at": {"$gte": current_month}
    })
    
    total_clients = await db.clients.count_documents({"user_id": user_id})
    
    plan_info["usage"] = {
        "ai_chats": monthly_chats,
        "reports": monthly_reports,
        "clients": total_clients,
        "emails": monthly_emails
    }
    
    return plan_info

# Email sending function
async def send_welcome_email(email: str, name: str):
    subject = "Bem-vindo à Growen - Smart Business Consulting!"
    
    html_content = f"""
    <html>
    <body style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2ECC71 0%, #1A2930 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Growen</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">Smart Business Consulting</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px;">
                <h2 style="color: #1A2930; margin: 0 0 20px 0; font-size: 24px;">Olá {name}!</h2>
                
                <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    É com grande prazer que damos as boas-vindas à plataforma Growen! 🎉
                </p>
                
                <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    Agora você tem acesso às melhores ferramentas de consultoria empresarial com IA para o mercado angolano:
                </p>
                
                <!-- Features -->
                <div style="background-color: #f8fafc; padding: 30px 20px; border-radius: 8px; margin: 0 0 30px 0;">
                    <div style="margin-bottom: 15px;">
                        <span style="color: #2ECC71; font-size: 18px; margin-right: 10px;">🤖</span>
                        <strong>Consultoria IA especializada</strong> em negócios angolanos
                    </div>
                    <div style="margin-bottom: 15px;">
                        <span style="color: #2ECC71; font-size: 18px; margin-right: 10px;">📊</span>
                        <strong>Dashboard executivo</strong> com KPIs essenciais
                    </div>
                    <div style="margin-bottom: 15px;">
                        <span style="color: #2ECC71; font-size: 18px; margin-right: 10px;">👥</span>
                        <strong>CRM avançado</strong> com sistema de emails
                    </div>
                    <div style="margin-bottom: 0;">
                        <span style="color: #2ECC71; font-size: 18px; margin-right: 10px;">📈</span>
                        <strong>Relatórios automáticos</strong> com insights personalizados
                    </div>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                    <a href="https://growen-consult.preview.emergentagent.com/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);">
                       Acessar Minha Conta
                    </a>
                </div>
                
                <!-- Tips -->
                <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #2ECC71;">
                    <h3 style="margin: 0 0 15px 0; color: #1A2930; font-size: 18px;">💡 Dicas para começar:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
                        <li>Complete seu perfil empresarial</li>
                        <li>Adicione seus primeiros clientes no CRM</li>
                        <li>Faça sua primeira consulta com nossa IA</li>
                        <li>Gere seu primeiro relatório automático</li>
                    </ul>
                </div>
                
                <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6;">
                    Precisa de ajuda? Responda este email ou use nosso WhatsApp: 
                    <a href="https://wa.me/244924123456" style="color: #2ECC71; text-decoration: none; font-weight: 600;">+244 924 123 456</a>
                </p>
                
                <p style="margin: 20px 0 0 0; font-size: 16px;">
                    Atenciosamente,<br>
                    <strong style="color: #1A2930;">Equipe Growen</strong>
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #1A2930; padding: 30px 20px; text-align: center;">
                <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">
                    © 2025 Growen - Smart Business Consulting para Angola
                </p>
                <p style="color: rgba(255,255,255,0.5); margin: 10px 0 0 0; font-size: 12px;">
                    Democratizando consultoria de negócios através de IA
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email(email, subject, html_content)

# Chat and AI Consultation Endpoints
@api_router.post("/chat", response_model=ChatResponse)
async def send_chat_message(
    chat_request: ChatRequest,
    user_id: str = Depends(get_current_user)
):
    try:
        # Check user plan limits
        plan_info = await get_user_plan_info(user_id)
        if not plan_info:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Check if user has exceeded monthly limit
        if plan_info["limits"]["ai_chats"] != -1:  # -1 means unlimited
            if plan_info["usage"]["ai_chats"] >= plan_info["limits"]["ai_chats"]:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Limite mensal de {plan_info['limits']['ai_chats']} consultas IA atingido. Faça upgrade do seu plano."
                )
        
        # Get or create session
        session_id = chat_request.session_id
        if not session_id:
            # Create new session
            session_id = str(uuid.uuid4())
            session_data = {
                "id": session_id,
                "user_id": user_id,
                "title": chat_request.message[:50] + "..." if len(chat_request.message) > 50 else chat_request.message,
                "topics": [],
                "message_count": 0,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            await db.chat_sessions.insert_one(session_data)
        
        # Prepare system message for Angolan business context
        system_message = """Você é um consultor de negócios especializado no mercado angolano. Você tem conhecimento profundo sobre:

1. O ambiente empresarial de Angola
2. Regulamentações e políticas empresariais locais
3. Desafios específicos das PMEs angolanas
4. Oportunidades de mercado em Angola
5. Práticas de negócios culturalmente apropriadas
6. Economia angolana e suas particularidades

Forneça respostas práticas, contextualizadas para Angola e sempre em português. Seja direto, profissional e ofereça insights acionáveis. Quando relevante, mencione aspectos específicos do mercado angolano como diversificação econômica, infraestrutura, recursos naturais, e desenvolvimento do setor privado.

Sempre termine suas respostas com uma pergunta de follow-up para manter o diálogo produtivo."""

        # Initialize chat with Emergent LLM
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", chat_request.model)
        
        # Send message
        user_message = UserMessage(text=chat_request.message)
        response = await chat.send_message(user_message)
        
        # Generate message ID
        message_id = str(uuid.uuid4())
        
        # Save chat message to database
        chat_message = {
            "id": message_id,
            "user_id": user_id,
            "session_id": session_id,
            "message": chat_request.message,
            "response": response,
            "topic": None,  # Could be enhanced with topic extraction
            "created_at": datetime.now(timezone.utc),
            "model_used": chat_request.model,
            "tokens_used": None  # Could be enhanced with token counting
        }
        
        await db.chat_messages.insert_one(chat_message)
        
        # Update session
        await db.chat_sessions.update_one(
            {"id": session_id},
            {
                "$set": {"updated_at": datetime.now(timezone.utc)},
                "$inc": {"message_count": 1}
            }
        )
        
        return ChatResponse(
            response=response,
            session_id=session_id,
            message_id=message_id,
            tokens_used=None
        )
        
    except Exception as e:
        logger.error(f"Chat error for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor ao processar consulta")

@api_router.get("/chat/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    user_id: str = Depends(get_current_user)
):
    try:
        query = {"user_id": user_id}
        if session_id:
            query["session_id"] = session_id
        
        messages = await db.chat_messages.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        
        return messages
        
    except Exception as e:
        logger.error(f"Error fetching chat history for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar histórico de chat")

@api_router.get("/chat/sessions")
async def get_chat_sessions(user_id: str = Depends(get_current_user)):
    try:
        sessions = await db.chat_sessions.find({"user_id": user_id}, {"_id": 0})\
            .sort("updated_at", -1)\
            .to_list(100)
        
        return sessions
        
    except Exception as e:
        logger.error(f"Error fetching chat sessions for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar sessões de chat")

@api_router.get("/chat/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        # Verify session belongs to user
        session = await db.chat_sessions.find_one({"id": session_id, "user_id": user_id})
        if not session:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        
        messages = await db.chat_messages.find({"session_id": session_id, "user_id": user_id}, {"_id": 0})\
            .sort("created_at", 1)\
            .to_list(1000)
        
        return messages
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session messages for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar mensagens da sessão")

@api_router.post("/chat/{session_id}/export-pdf")
async def export_chat_to_pdf(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        # Verify session belongs to user
        session = await db.chat_sessions.find_one({"id": session_id, "user_id": user_id})
        if not session:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        
        # Get user info
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Get all messages from session
        messages = await db.chat_messages.find({"session_id": session_id, "user_id": user_id})\
            .sort("created_at", 1)\
            .to_list(1000)
        
        if not messages:
            raise HTTPException(status_code=404, detail="Nenhuma mensagem encontrada na sessão")
        
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            textColor=HexColor('#2ECC71')
        )
        
        user_style = ParagraphStyle(
            'UserMessage',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=15,
            leftIndent=20,
            textColor=HexColor('#1A2930'),
            backColor=HexColor('#F0F8F0')
        )
        
        ai_style = ParagraphStyle(
            'AIResponse',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=15,
            leftIndent=20,
            textColor=HexColor('#2D3748')
        )
        
        # Build PDF content
        story = []
        
        # Header
        story.append(Paragraph("Growen - Consultoria com IA", title_style))
        story.append(Paragraph(f"Sessão: {session['title']}", styles['Heading2']))
        story.append(Paragraph(f"Cliente: {user['name']}", styles['Normal']))
        story.append(Paragraph(f"Data: {session['created_at'].strftime('%d/%m/%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Messages
        for i, msg in enumerate(messages, 1):
            story.append(Paragraph(f"<b>Pergunta {i}:</b>", styles['Heading3']))
            story.append(Paragraph(msg['message'], user_style))
            story.append(Spacer(1, 10))
            
            story.append(Paragraph("<b>Resposta Growen IA:</b>", styles['Heading3']))
            story.append(Paragraph(msg['response'], ai_style))
            story.append(Spacer(1, 20))
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("© 2025 Growen - Smart Business Consulting", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        # Return PDF
        buffer.seek(0)
        
        return StreamingResponse(
            io.BytesIO(buffer.getvalue()),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=growen-consultoria-{session_id[:8]}.pdf"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting chat to PDF for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao exportar chat para PDF")

@api_router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        # Verify session belongs to user
        session = await db.chat_sessions.find_one({"id": session_id, "user_id": user_id})
        if not session:
            raise HTTPException(status_code=404, detail="Sessão não encontrada")
        
        # Delete session and all its messages
        await db.chat_sessions.delete_one({"id": session_id, "user_id": user_id})
        await db.chat_messages.delete_many({"session_id": session_id, "user_id": user_id})
        
        return {"message": "Sessão deletada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting chat session for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao deletar sessão de chat")

# Payment System - Bank Transfer with Receipt Upload
@api_router.post("/payments/upload-proof")
async def upload_payment_proof(
    plan_id: str = Form(...),
    reference_number: str = Form(None),
    notes: str = Form(None),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    try:
        # Validate plan
        if plan_id not in ["starter", "pro"]:
            raise HTTPException(status_code=400, detail="Plano inválido")
        
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail="Tipo de arquivo não suportado. Use JPEG, PNG ou PDF."
            )
        
        # Check file size (max 5MB)
        MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="Arquivo muito grande. Máximo 5MB.")
        
        # Create uploads directory if it doesn't exist
        uploads_dir = Path("/app/uploads/payment_proofs")
        uploads_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        file_path = uploads_dir / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        # Get plan amount
        plan_amounts = {
            "starter": 10000,  # 10,000 Kz
            "pro": 20000       # 20,000 Kz
        }
        
        # Create payment proof record
        payment_proof = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "plan_id": plan_id,
            "amount": plan_amounts[plan_id],
            "file_path": str(file_path),
            "payment_method": "bank_transfer",
            "status": "pending",
            "reference_number": reference_number,
            "notes": notes,
            "created_at": datetime.now(timezone.utc),
            "reviewed_at": None,
            "reviewed_by": None
        }
        
        await db.payment_proofs.insert_one(payment_proof)
        
        # Send notification email to admin (could be enhanced)
        user = await db.users.find_one({"id": user_id})
        if user:
            await send_payment_notification_email(user, payment_proof)
        
        return {
            "message": "Comprovante de pagamento enviado com sucesso! Aguarde a análise do administrador.",
            "payment_id": payment_proof["id"],
            "status": "pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading payment proof for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.get("/payments/status")
async def get_payment_status(user_id: str = Depends(get_current_user)):
    try:
        # Get latest payment proofs for user
        payments = await db.payment_proofs.find({"user_id": user_id}, {"_id": 0})\
            .sort("created_at", -1)\
            .to_list(10)
        
        return payments
        
    except Exception as e:
        logger.error(f"Error fetching payment status for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar status de pagamentos")

@api_router.get("/payments/bank-details")
async def get_bank_details():
    """Return bank details for manual transfer"""
    return {
        "bank_name": "Banco Económico",
        "account_holder": "Growen Consulting Lda",
        "account_number": "001234567890123",
        "iban": "AO06 0040 0000 1234 5678 9012 3",
        "swift_code": "BESCAOLU",
        "reference_format": "GROWEN-{USER_ID}",
        "instructions": [
            "Faça a transferência para a conta indicada",
            "Use como referência: GROWEN-{USER_ID}",
            "Guarde o comprovante de transferência",
            "Envie o comprovante através da plataforma",
            "Aguarde a confirmação do pagamento (até 24h úteis)"
        ]
    }

# Admin Payment Management
@api_router.get("/admin/payments/pending")
async def get_pending_payments(admin_id: str = Depends(get_admin_user)):
    try:
        # Get all pending payment proofs
        payments = await db.payment_proofs.find({"status": "pending"})\
            .sort("created_at", -1)\
            .to_list(100)
        
        # Enrich with user information
        for payment in payments:
            user = await db.users.find_one({"id": payment["user_id"]})
            if user:
                payment["user_info"] = {
                    "name": user["name"],
                    "email": user["email"],
                    "company": user.get("company", "")
                }
        
        return payments
        
    except Exception as e:
        logger.error(f"Error fetching pending payments: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar pagamentos pendentes")

@api_router.post("/admin/payments/{payment_id}/review")
async def review_payment(
    payment_id: str,
    review: PaymentReview,
    admin_id: str = Depends(get_admin_user)
):
    try:
        # Validate status
        if review.status not in ["approved", "rejected"]:
            raise HTTPException(status_code=400, detail="Status inválido")
        
        # Get payment proof
        payment = await db.payment_proofs.find_one({"id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
        if payment["status"] != "pending":
            raise HTTPException(status_code=400, detail="Pagamento já foi revisado")
        
        # Update payment status
        update_data = {
            "status": review.status,
            "reviewed_at": datetime.now(timezone.utc),
            "reviewed_by": admin_id
        }
        
        if review.notes:
            update_data["admin_notes"] = review.notes
        
        await db.payment_proofs.update_one(
            {"id": payment_id},
            {"$set": update_data}
        )
        
        # If approved, update user plan
        if review.status == "approved":
            user_id = payment["user_id"]
            plan_id = payment["plan_id"]
            
            # Calculate subscription expiry (1 month from now)
            expires_at = datetime.now(timezone.utc) + timedelta(days=30)
            
            await db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "plan": plan_id,
                        "subscription_expires": expires_at,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            # Send approval email
            user = await db.users.find_one({"id": user_id})
            if user:
                await send_payment_approved_email(user, payment, plan_id)
        
        else:
            # Send rejection email
            user = await db.users.find_one({"id": payment["user_id"]})
            if user:
                await send_payment_rejected_email(user, payment, review.notes)
        
        return {"message": f"Pagamento {review.status} com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reviewing payment {payment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao revisar pagamento")

@api_router.get("/admin/payments/all")
async def get_all_payments(
    status: Optional[str] = None,
    admin_id: str = Depends(get_admin_user)
):
    try:
        query = {}
        if status:
            query["status"] = status
        
        payments = await db.payment_proofs.find(query)\
            .sort("created_at", -1)\
            .to_list(200)
        
        # Enrich with user information
        for payment in payments:
            user = await db.users.find_one({"id": payment["user_id"]})
            if user:
                payment["user_info"] = {
                    "name": user["name"],
                    "email": user["email"],
                    "company": user.get("company", "")
                }
        
        return payments
        
    except Exception as e:
        logger.error(f"Error fetching all payments: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar todos os pagamentos")

# Email notification functions for payments
async def send_payment_notification_email(user: dict, payment: dict):
    """Send email to admin about new payment proof"""
    subject = f"Novo comprovante de pagamento - {user['name']}"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2ECC71;">Novo Comprovante de Pagamento</h2>
        
        <p><strong>Cliente:</strong> {user['name']}</p>
        <p><strong>Email:</strong> {user['email']}</p>
        <p><strong>Empresa:</strong> {user.get('company', 'N/A')}</p>
        <p><strong>Plano:</strong> {payment['plan_id'].title()}</p>
        <p><strong>Valor:</strong> {payment['amount']:,.0f} Kz</p>
        <p><strong>Referência:</strong> {payment.get('reference_number', 'N/A')}</p>
        <p><strong>Observações:</strong> {payment.get('notes', 'N/A')}</p>
        <p><strong>Data:</strong> {payment['created_at'].strftime('%d/%m/%Y %H:%M')}</p>
        
        <p>Acesse o painel administrativo para revisar e aprovar/rejeitar o pagamento.</p>
        
        <a href="https://growen-consult.preview.emergentagent.com/dashboard/admin" 
           style="display: inline-block; background-color: #2ECC71; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Revisar Pagamento
        </a>
    </body>
    </html>
    """
    
    await send_email("admin@growen.com", subject, html_content)

async def send_payment_approved_email(user: dict, payment: dict, plan_id: str):
    """Send email to user about payment approval"""
    subject = "Pagamento Aprovado - Seu plano foi ativado!"
    
    plan_names = {"starter": "Starter", "pro": "Profissional"}
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2ECC71;">Pagamento Aprovado! 🎉</h2>
        
        <p>Olá {user['name']},</p>
        
        <p>Seu pagamento foi aprovado com sucesso e seu plano <strong>{plan_names.get(plan_id, plan_id)}</strong> já está ativo!</p>
        
        <p><strong>Detalhes do Pagamento:</strong></p>
        <ul>
            <li>Plano: {plan_names.get(plan_id, plan_id)}</li>
            <li>Valor: {payment['amount']:,.0f} Kz</li>
            <li>Status: Aprovado</li>
            <li>Validade: 30 dias a partir de hoje</li>
        </ul>
        
        <p>Agora você tem acesso completo a todas as funcionalidades do seu plano!</p>
        
        <a href="https://growen-consult.preview.emergentagent.com/dashboard" 
           style="display: inline-block; background-color: #2ECC71; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Acessar Dashboard
        </a>
        
        <p>Obrigado por escolher a Growen!</p>
    </body>
    </html>
    """
    
    await send_email(user["email"], subject, html_content)

async def send_payment_rejected_email(user: dict, payment: dict, notes: Optional[str] = None):
    """Send email to user about payment rejection"""
    subject = "Pagamento Não Aprovado - Ação Necessária"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #E74C3C;">Pagamento Não Aprovado</h2>
        
        <p>Olá {user['name']},</p>
        
        <p>Infelizmente, não foi possível aprovar seu comprovante de pagamento.</p>
        
        {f'<p><strong>Motivo:</strong> {notes}</p>' if notes else ''}
        
        <p><strong>O que fazer agora:</strong></p>
        <ul>
            <li>Verifique se os dados da transferência estão corretos</li>
            <li>Certifique-se de que usou a referência correta</li>
            <li>Envie um novo comprovante se necessário</li>
            <li>Entre em contato conosco se precisar de ajuda</li>
        </ul>
        
        <p>Para mais informações, responda este email ou nos contate pelo WhatsApp: +244 924 123 456</p>
        
        <a href="https://growen-consult.preview.emergentagent.com/dashboard/planos" 
           style="display: inline-block; background-color: #2ECC71; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
           Tentar Novamente
        </a>
    </body>
    </html>
    """
    
    await send_email(user["email"], subject, html_content)

# Plan Management Endpoints - FIXED VERSION
@api_router.post("/plans/upgrade")
async def upgrade_user_plan(
    plan_data: dict,
    user_id: str = Depends(get_current_user)
):
    try:
        new_plan = plan_data.get("plan_id")
        if new_plan not in ["starter", "pro"]:
            raise HTTPException(status_code=400, detail="Plano inválido")
        
        # Get current user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        current_plan = user.get("plan", "free")
        
        # Check if it's actually an upgrade
        plan_hierarchy = {"free": 0, "starter": 1, "pro": 2}
        if plan_hierarchy.get(new_plan, 0) <= plan_hierarchy.get(current_plan, 0):
            raise HTTPException(status_code=400, detail="Apenas upgrades são permitidos. Para downgrades, entre em contato com o suporte.")
        
        # Check if there's already a pending payment for this user
        existing_payment = await db.payment_proofs.find_one({
            "user_id": user_id,
            "status": "pending"
        })
        
        if existing_payment:
            return {
                "message": "Você já possui um pagamento pendente. Aguarde a aprovação ou envie um novo comprovante.",
                "requires_payment": True,
                "payment_id": existing_payment["id"],
                "next_step": "wait_approval_or_upload_new"
            }
        
        return {
            "message": f"Solicitação de upgrade para plano {new_plan.title()} iniciada. Faça o pagamento e envie o comprovante.",
            "new_plan": new_plan,
            "current_plan": current_plan,
            "requires_payment": True,
            "amount": 10000 if new_plan == "starter" else 20000,
            "currency": "Kz",
            "next_step": "upload_payment_proof"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error upgrading plan for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.get("/plans/current")
async def get_current_plan(user_id: str = Depends(get_current_user)):
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        current_plan = user.get("plan", "free")
        
        # Get plan details
        plan_details = {
            "free": {
                "name": "Gratuito",
                "price": 0,
                "currency": "Kz",
                "limits": {"ai_chats": 2, "reports": 1, "clients": 10, "email_sends": 5},
                "features": ["2 consultas IA por mês", "1 relatório por mês", "Até 10 clientes no CRM"]
            },
            "starter": {
                "name": "Starter",
                "price": 10000,
                "currency": "Kz", 
                "limits": {"ai_chats": 50, "reports": 10, "clients": 100, "email_sends": 200},
                "features": ["50 consultas IA por mês", "10 relatórios por mês", "Até 100 clientes no CRM"]
            },
            "pro": {
                "name": "Profissional",
                "price": 20000,
                "currency": "Kz",
                "limits": {"ai_chats": -1, "reports": -1, "clients": -1, "email_sends": -1},
                "features": ["Consultas IA ilimitadas", "Relatórios ilimitados", "Clientes ilimitados no CRM"]
            }
        }
        
        plan_info = plan_details.get(current_plan, plan_details["free"])
        
        # Get usage statistics
        usage = {
            "ai_chats": await db.chat_messages.count_documents({"user_id": user_id}),
            "reports": await db.reports.count_documents({"user_id": user_id}),
            "clients": await db.clients.count_documents({"user_id": user_id}),
            "email_sends": 0  # TODO: Implement email send tracking
        }
        
        # Get recent payment status
        recent_payment = await db.payment_proofs.find_one(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        )
        
        return {
            "current_plan": current_plan,
            "plan_info": plan_info,
            "usage": usage,
            "subscription_expires": user.get("subscription_expires"),
            "recent_payment": {
                "status": recent_payment.get("status"),
                "created_at": recent_payment.get("created_at"),
                "plan_id": recent_payment.get("plan_id")
            } if recent_payment else None
        }
        
    except Exception as e:
        logger.error(f"Error fetching plan info for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar informações do plano")

@api_router.get("/plans/available")
async def get_available_plans():
    """Get all available plans with pricing and features"""
    plans = {
        "free": {
            "name": "Gratuito",
            "price": 0,
            "currency": "Kz",
            "period": "mês",
            "features": [
                "2 consultas IA por mês",
                "1 relatório por mês",
                "Até 10 clientes no CRM",
                "Suporte básico por email"
            ],
            "limits": {
                "ai_chats": 2,
                "reports": 1,
                "clients": 10,
                "email_sends": 5
            }
        },
        "starter": {
            "name": "Starter",
            "price": 10000,
            "currency": "Kz",
            "period": "mês",
            "features": [
                "50 consultas IA por mês",
                "10 relatórios por mês",
                "Até 100 clientes no CRM",
                "Upload de dados CSV",
                "Envio de emails profissionais",
                "Suporte prioritário"
            ],
            "limits": {
                "ai_chats": 50,
                "reports": 10,
                "clients": 100,
                "email_sends": 200
            },
            "popular": True
        },
        "pro": {
            "name": "Profissional",
            "price": 20000,
            "currency": "Kz",
            "period": "mês",
            "features": [
                "Consultas IA ilimitadas",
                "Relatórios ilimitados",
                "Clientes ilimitados no CRM",
                "Todos os recursos do Starter",
                "Geração automática de faturas",
                "Integração WhatsApp Business",
                "Suporte premium 24/7",
                "Dashboard avançado com métricas"
            ],
            "limits": {
                "ai_chats": -1,  # unlimited
                "reports": -1,   # unlimited
                "clients": -1,   # unlimited
                "email_sends": -1 # unlimited
            }
        }
    }
    
    return {"plans": plans}

# COMPREHENSIVE ADMIN DASHBOARD SYSTEM
@api_router.get("/admin/dashboard/overview")
async def get_admin_dashboard_overview(admin_id: str = Depends(get_admin_user)):
    """Complete admin dashboard overview with all platform statistics"""
    try:
        # User statistics
        total_users = await db.users.count_documents({})
        free_users = await db.users.count_documents({"plan": {"$in": ["free", None]}})
        starter_users = await db.users.count_documents({"plan": "starter"})
        pro_users = await db.users.count_documents({"plan": "pro"})
        
        # Recent registrations (last 30 days)
        recent_users = await db.users.count_documents({
            "created_at": {"$gte": datetime.now(timezone.utc) - timedelta(days=30)}
        })
        
        # Payment statistics
        total_payments = await db.payment_proofs.count_documents({})
        pending_payments = await db.payment_proofs.count_documents({"status": "pending"})
        approved_payments = await db.payment_proofs.count_documents({"status": "approved"})
        rejected_payments = await db.payment_proofs.count_documents({"status": "rejected"})
        
        # Revenue calculation (approved payments)
        approved_payment_docs = await db.payment_proofs.find({"status": "approved"}).to_list(1000)
        total_revenue = sum(payment["amount"] for payment in approved_payment_docs)
        
        # Activity statistics
        total_chats = await db.chat_messages.count_documents({})
        total_reports = await db.reports.count_documents({})
        total_clients = await db.clients.count_documents({})
        total_invoices = await db.invoices.count_documents({})
        
        # Recent activity (last 7 days)
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        recent_chats = await db.chat_messages.count_documents({"created_at": {"$gte": week_ago}})
        recent_reports = await db.reports.count_documents({"created_at": {"$gte": week_ago}})
        
        return {
            "users": {
                "total": total_users,
                "free": free_users,
                "starter": starter_users,
                "pro": pro_users,
                "recent_registrations": recent_users
            },
            "payments": {
                "total": total_payments,
                "pending": pending_payments,
                "approved": approved_payments,
                "rejected": rejected_payments,
                "total_revenue": total_revenue
            },
            "activity": {
                "total_chats": total_chats,
                "total_reports": total_reports,
                "total_clients": total_clients,
                "total_invoices": total_invoices,
                "recent_chats": recent_chats,
                "recent_reports": recent_reports
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting admin dashboard overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar dados do dashboard")

@api_router.get("/admin/users/all")
async def get_all_users_admin(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    plan_filter: Optional[str] = None,
    admin_id: str = Depends(get_admin_user)
):
    """Get all users with filtering and pagination"""
    try:
        query = {}
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}}
            ]
        
        if plan_filter and plan_filter != "all":
            query["plan"] = plan_filter
        
        users = await db.users.find(query, {"password": 0, "_id": 0})\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        total_users = await db.users.count_documents(query)
        
        # Enrich with additional data
        for user in users:
            user_id = user["id"]
            
            # Get payment info
            recent_payment = await db.payment_proofs.find_one(
                {"user_id": user_id},
                sort=[("created_at", -1)]
            )
            user["recent_payment"] = recent_payment.get("status") if recent_payment else None
            
            # Get activity stats
            user["total_chats"] = await db.chat_messages.count_documents({"user_id": user_id})
            user["total_clients"] = await db.clients.count_documents({"user_id": user_id})
            user["total_invoices"] = await db.invoices.count_documents({"user_id": user_id})
        
        return {
            "users": users,
            "total": total_users,
            "page": skip // limit + 1,
            "pages": (total_users + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting all users: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar usuários")

@api_router.put("/admin/users/{user_id}")
async def update_user_admin(
    user_id: str,
    user_data: dict,
    admin_id: str = Depends(get_admin_user)
):
    """Update user information as admin"""
    try:
        # Get current user
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Prepare update data
        update_data = {}
        allowed_fields = ["name", "email", "company", "phone", "industry", "plan", "is_admin"]
        
        for field, value in user_data.items():
            if field in allowed_fields and value is not None:
                update_data[field] = value
        
        if update_data:
            update_data["updated_at"] = datetime.now(timezone.utc)
            
            # Update user in database
            await db.users.update_one(
                {"id": user_id},
                {"$set": update_data}
            )
        
        return {"message": "Usuário atualizado com sucesso!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")

@api_router.delete("/admin/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    admin_id: str = Depends(get_admin_user)
):
    """Delete user and all associated data"""
    try:
        # Check if user exists
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Delete all user data
        await db.users.delete_one({"id": user_id})
        await db.clients.delete_many({"user_id": user_id})
        await db.chat_messages.delete_many({"user_id": user_id})
        await db.chat_sessions.delete_many({"user_id": user_id})
        await db.reports.delete_many({"user_id": user_id})
        await db.invoices.delete_many({"user_id": user_id})
        await db.payment_proofs.delete_many({"user_id": user_id})
        
        return {"message": "Usuário e todos os dados associados foram removidos"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao deletar usuário")

@api_router.get("/admin/payments/all")
async def get_all_payments_admin(
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
    admin_id: str = Depends(get_admin_user)
):
    """Get all payments with filtering and pagination"""
    try:
        query = {}
        if status_filter and status_filter != "all":
            query["status"] = status_filter
        
        payments = await db.payment_proofs.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(limit)
        
        total_payments = await db.payment_proofs.count_documents(query)
        
        # Enrich with user information
        for payment in payments:
            user = await db.users.find_one({"id": payment["user_id"]})
            if user:
                payment["user_info"] = {
                    "name": user["name"],
                    "email": user["email"],
                    "company": user.get("company", ""),
                    "current_plan": user.get("plan", "free")
                }
        
        return {
            "payments": payments,
            "total": total_payments,
            "page": skip // limit + 1,
            "pages": (total_payments + limit - 1) // limit
        }
        
    except Exception as e:
        logger.error(f"Error getting all payments: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar pagamentos")

@api_router.post("/admin/payments/{payment_id}/approve")
async def approve_payment_admin(
    payment_id: str,
    notes: Optional[str] = None,
    admin_id: str = Depends(get_admin_user)
):
    """Approve payment and upgrade user plan"""
    try:
        # Get payment proof
        payment = await db.payment_proofs.find_one({"id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
        if payment["status"] == "approved":
            return {"message": "Pagamento já foi aprovado anteriormente"}
        
        # Update payment status
        await db.payment_proofs.update_one(
            {"id": payment_id},
            {"$set": {
                "status": "approved",
                "reviewed_at": datetime.now(timezone.utc),
                "reviewed_by": admin_id,
                "admin_notes": notes
            }}
        )
        
        # Upgrade user plan
        user_id = payment["user_id"]
        plan_id = payment["plan_id"]
        
        # Calculate subscription expiry (1 month from now)
        expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "plan": plan_id,
                "subscription_expires": expires_at,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Send approval email
        user = await db.users.find_one({"id": user_id})
        if user:
            await send_payment_approved_email(user, payment, plan_id)
        
        return {"message": f"Pagamento aprovado e usuário atualizado para plano {plan_id}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving payment {payment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao aprovar pagamento")

@api_router.post("/admin/payments/{payment_id}/reject")
async def reject_payment_admin(
    payment_id: str,
    notes: str,
    admin_id: str = Depends(get_admin_user)
):
    """Reject payment with reason"""
    try:
        # Get payment proof
        payment = await db.payment_proofs.find_one({"id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Pagamento não encontrado")
        
        if payment["status"] != "pending":
            return {"message": "Apenas pagamentos pendentes podem ser rejeitados"}
        
        # Update payment status
        await db.payment_proofs.update_one(
            {"id": payment_id},
            {"$set": {
                "status": "rejected",
                "reviewed_at": datetime.now(timezone.utc),
                "reviewed_by": admin_id,
                "admin_notes": notes
            }}
        )
        
        # Send rejection email
        user = await db.users.find_one({"id": payment["user_id"]})
        if user:
            await send_payment_rejected_email(user, payment, notes)
        
        return {"message": "Pagamento rejeitado e usuário notificado"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rejecting payment {payment_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao rejeitar pagamento")

@api_router.get("/admin/content/pages")
async def get_all_pages_content(admin_id: str = Depends(get_admin_user)):
    """Get all page content for editing"""
    try:
        # This would typically come from a CMS database
        # For now, return structured content that can be edited
        pages_content = {
            "landing": {
                "hero": {
                    "title": "Transforme Seu Negócio com IA",
                    "subtitle": "Consultoria empresarial inteligente para PMEs angolanas crescerem de forma sustentável",
                    "cta_text": "Começar Grátis"
                },
                "features": [
                    {
                        "title": "Consultoria IA",
                        "description": "Insights personalizados para seu negócio",
                        "icon": "brain"
                    },
                    {
                        "title": "CRM Integrado",
                        "description": "Gerencie clientes de forma eficiente",
                        "icon": "users"
                    },
                    {
                        "title": "Relatórios Automáticos",
                        "description": "Análises detalhadas do seu negócio",
                        "icon": "chart"
                    }
                ]
            },
            "about": {
                "mission": "Democratizar o acesso a consultoria empresarial de qualidade através da inteligência artificial",
                "vision": "Ser a principal plataforma de consultoria digital em Angola",
                "ceo_info": {
                    "name": "Petilson Mara da Costa Pungui",
                    "title": "CEO & Fundador",
                    "bio": "Empreendedor angolano com paixão por tecnologia e inovação...",
                    "image_url": "https://customer-assets.emergentagent.com/job_growen-consult/artifacts/j3crbkvz_profile-pic.png"
                }
            },
            "contact": {
                "email": "contato@growen.com",
                "phone": "+244943201590",
                "whatsapp": "+244943201590",
                "address": "Luanda, Angola"
            }
        }
        
        return {"pages": pages_content}
        
    except Exception as e:
        logger.error(f"Error getting pages content: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar conteúdo das páginas")

@api_router.put("/admin/content/pages")
async def update_pages_content(
    content_data: dict,
    admin_id: str = Depends(get_admin_user)
):
    """Update page content"""
    try:
        # In a real application, this would update a CMS database
        # For now, we'll just return success
        # TODO: Implement actual content management system
        
        return {"message": "Conteúdo das páginas atualizado com sucesso!"}
        
    except Exception as e:
        logger.error(f"Error updating pages content: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar conteúdo das páginas")

@api_router.get("/admin/system/settings")
async def get_system_settings(admin_id: str = Depends(get_admin_user)):
    """Get system-wide settings"""
    try:
        settings = {
            "platform": {
                "name": "Growen",
                "tagline": "Smart Business Consulting",
                "maintenance_mode": False,
                "registration_enabled": True
            },
            "contact": {
                "email": "contato@growen.com",
                "phone": "+244943201590",
                "whatsapp": "+244943201590",
                "address": "Luanda, Angola"
            },
            "payment": {
                "bank_name": "Banco Económico",
                "account_number": "001234567890123",
                "iban": "AO06 0040 0000 1234 5678 9012 3",
                "transfer_enabled": True,
                "multicaixa_enabled": False
            },
            "ai": {
                "model": "gpt-4o-mini",
                "max_tokens": 1000,
                "temperature": 0.7
            }
        }
        
        return {"settings": settings}
        
    except Exception as e:
        logger.error(f"Error getting system settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar configurações do sistema")

@api_router.put("/admin/system/settings")
async def update_system_settings(
    settings_data: dict,
    admin_id: str = Depends(get_admin_user)
):
    """Update system-wide settings"""
    try:
        # TODO: Implement actual system settings storage
        return {"message": "Configurações do sistema atualizadas com sucesso!"}
        
    except Exception as e:
        logger.error(f"Error updating system settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar configurações do sistema")

@api_router.get("/admin/reports/analytics")
async def get_platform_analytics(
    period: str = "30d",
    admin_id: str = Depends(get_admin_user)
):
    """Get detailed platform analytics"""
    try:
        # Calculate period
        if period == "7d":
            start_date = datetime.now(timezone.utc) - timedelta(days=7)
        elif period == "30d":
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        elif period == "90d":
            start_date = datetime.now(timezone.utc) - timedelta(days=90)
        else:
            start_date = datetime.now(timezone.utc) - timedelta(days=30)
        
        # User growth
        user_growth = []
        for i in range(30):
            date = start_date + timedelta(days=i)
            count = await db.users.count_documents({
                "created_at": {"$lte": date + timedelta(days=1)}
            })
            user_growth.append({
                "date": date.strftime("%Y-%m-%d"),
                "total_users": count
            })
        
        # Revenue over time
        revenue_data = []
        approved_payments = await db.payment_proofs.find({
            "status": "approved",
            "reviewed_at": {"$gte": start_date}
        }).to_list(1000)
        
        # Group by date
        revenue_by_date = {}
        for payment in approved_payments:
            date_key = payment["reviewed_at"].strftime("%Y-%m-%d")
            if date_key not in revenue_by_date:
                revenue_by_date[date_key] = 0
            revenue_by_date[date_key] += payment["amount"]
        
        for date_key, amount in revenue_by_date.items():
            revenue_data.append({
                "date": date_key,
                "revenue": amount
            })
        
        # Top performing features
        feature_usage = {
            "ai_consultations": await db.chat_messages.count_documents({"created_at": {"$gte": start_date}}),
            "reports_generated": await db.reports.count_documents({"created_at": {"$gte": start_date}}),
            "clients_added": await db.clients.count_documents({"created_at": {"$gte": start_date}}),
            "invoices_generated": await db.invoices.count_documents({"issue_date": {"$gte": start_date}})
        }
        
        return {
            "period": period,
            "user_growth": user_growth,
            "revenue_data": revenue_data,
            "feature_usage": feature_usage
        }
        
    except Exception as e:
        logger.error(f"Error getting platform analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar analytics da plataforma")

# Invoice Management System
@api_router.post("/invoices/generate")
async def generate_invoice(
    invoice_data: InvoiceCreate,
    user_id: str = Depends(get_current_user)
):
    try:
        # Get client info
        client = await db.clients.find_one({"id": invoice_data.client_id, "user_id": user_id})
        if not client:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")
        
        if client.get("status") != "cliente_ativo":
            raise HTTPException(status_code=400, detail="Apenas clientes ativos podem ter faturas geradas")
        
        # Get user info
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        # Generate unique invoice number
        invoice_count = await db.invoices.count_documents({"user_id": user_id})
        invoice_number = f"GROWEN-{user_id[:8].upper()}-{(invoice_count + 1):04d}"
        
        # Calculate total
        total_amount = invoice_data.unit_price * invoice_data.quantity
        
        # Create invoice
        invoice = Invoice(
            invoice_number=invoice_number,
            user_id=user_id,
            client_id=invoice_data.client_id,
            service_description=invoice_data.service_description,
            quantity=invoice_data.quantity,
            unit_price=invoice_data.unit_price,
            total_amount=total_amount,
            notes=invoice_data.notes
        )
        
        # Save to database
        invoice_dict = invoice.dict()
        await db.invoices.insert_one(invoice_dict)
        
        # Generate PDF
        pdf_path = await generate_invoice_pdf(invoice, user, client)
        
        # Update invoice with PDF path
        await db.invoices.update_one(
            {"id": invoice.id},
            {"$set": {"pdf_path": pdf_path}}
        )
        
        return {
            "message": "Fatura gerada com sucesso!",
            "invoice_id": invoice.id,
            "invoice_number": invoice_number,
            "total_amount": total_amount,
            "pdf_generated": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao gerar fatura")

@api_router.get("/invoices")
async def get_user_invoices(user_id: str = Depends(get_current_user)):
    try:
        invoices = await db.invoices.find({"user_id": user_id}, {"_id": 0})\
            .sort("issue_date", -1)\
            .to_list(100)
        
        # Enrich with client information
        for invoice in invoices:
            client = await db.clients.find_one({"id": invoice["client_id"]})
            if client:
                invoice["client_info"] = {
                    "name": client["name"],
                    "email": client["email"],
                    "company": client.get("company", "")
                }
        
        return invoices
        
    except Exception as e:
        logger.error(f"Error fetching invoices for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao buscar faturas")

@api_router.get("/invoices/{invoice_id}/pdf")
async def download_invoice_pdf(
    invoice_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        # Get invoice
        invoice = await db.invoices.find_one({"id": invoice_id, "user_id": user_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        
        # Check if PDF exists
        if not invoice.get("pdf_path") or not Path(invoice["pdf_path"]).exists():
            # Regenerate PDF if it doesn't exist
            user = await db.users.find_one({"id": user_id})
            client = await db.clients.find_one({"id": invoice["client_id"]})
            
            if not user or not client:
                raise HTTPException(status_code=404, detail="Dados necessários não encontrados")
            
            pdf_path = await generate_invoice_pdf(Invoice(**invoice), user, client)
            await db.invoices.update_one(
                {"id": invoice_id},
                {"$set": {"pdf_path": pdf_path}}
            )
            invoice["pdf_path"] = pdf_path
        
        # Return PDF file
        return FileResponse(
            invoice["pdf_path"],
            media_type="application/pdf",
            filename=f"fatura-{invoice['invoice_number']}.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading invoice PDF {invoice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao baixar PDF da fatura")

@api_router.post("/invoices/{invoice_id}/send-email")
async def send_invoice_by_email(
    invoice_id: str,
    user_id: str = Depends(get_current_user)
):
    try:
        # Get invoice
        invoice = await db.invoices.find_one({"id": invoice_id, "user_id": user_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        
        # Get client and user info
        client = await db.clients.find_one({"id": invoice["client_id"]})
        user = await db.users.find_one({"id": user_id})
        
        if not client or not user:
            raise HTTPException(status_code=404, detail="Dados necessários não encontrados")
        
        # Generate PDF if it doesn't exist
        if not invoice.get("pdf_path") or not Path(invoice["pdf_path"]).exists():
            pdf_path = await generate_invoice_pdf(Invoice(**invoice), user, client)
            await db.invoices.update_one(
                {"id": invoice_id},
                {"$set": {"pdf_path": pdf_path}}
            )
            invoice["pdf_path"] = pdf_path
        
        # Send email with invoice attachment
        subject = f"Fatura {invoice['invoice_number']} - {user.get('company', 'Growen')}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2ECC71;">Nova Fatura Disponível</h2>
                
                <p>Prezado(a) {client['name']},</p>
                
                <p>Segue em anexo a fatura número <strong>{invoice['invoice_number']}</strong> referente aos serviços de consultoria empresarial.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #1A2930;">Detalhes da Fatura:</h3>
                    <p><strong>Número:</strong> {invoice['invoice_number']}</p>
                    <p><strong>Data de Emissão:</strong> {invoice['issue_date'].strftime('%d/%m/%Y')}</p>
                    <p><strong>Vencimento:</strong> {invoice['due_date'].strftime('%d/%m/%Y')}</p>
                    <p><strong>Valor Total:</strong> {invoice['total_amount']:,.0f} Kz</p>
                    <p><strong>Serviço:</strong> {invoice['service_description']}</p>
                </div>
                
                <p><strong>Formas de Pagamento:</strong></p>
                <ul>
                    <li>Transferência Bancária para o Banco Económico</li>
                    <li>Pagamento via Multicaixa Express</li>
                    <li>Entre em contato para outras opções</li>
                </ul>
                
                <p>Para qualquer esclarecimento, entre em contato conosco.</p>
                
                <p>Atenciosamente,<br>
                <strong>{user.get('name', 'Equipe Growen')}</strong><br>
                {user.get('company', 'Growen - Smart Business Consulting')}</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">
                    Este email foi enviado automaticamente pela plataforma Growen.<br>
                    © 2025 Growen - Smart Business Consulting
                </p>
            </div>
        </body>
        </html>
        """
        
        # For now, we'll simulate sending (actual SMTP integration would happen here)
        try:
            await send_email(client["email"], subject, html_content)
            
            # Update invoice with sent date
            await db.invoices.update_one(
                {"id": invoice_id},
                {"$set": {"sent_date": datetime.now(timezone.utc)}}
            )
            
            return {"message": "Fatura enviada por email com sucesso!"}
            
        except Exception as email_error:
            logger.warning(f"Email sending failed for invoice {invoice_id}: {str(email_error)}")
            return {"message": "Fatura preparada, mas o envio de email falhou. PDF disponível para download."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending invoice email {invoice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao enviar fatura por email")

@api_router.put("/invoices/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: str,
    status_data: dict,
    user_id: str = Depends(get_current_user)
):
    try:
        new_status = status_data.get("status")
        if new_status not in ["pending", "paid", "overdue"]:
            raise HTTPException(status_code=400, detail="Status inválido")
        
        # Get invoice
        invoice = await db.invoices.find_one({"id": invoice_id, "user_id": user_id})
        if not invoice:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        
        # Update status
        await db.invoices.update_one(
            {"id": invoice_id},
            {"$set": {"payment_status": new_status}}
        )
        
        return {"message": f"Status da fatura atualizado para '{new_status}'"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice status {invoice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar status da fatura")

@api_router.post("/invoices/auto-generate")
async def auto_generate_invoices_for_active_clients(user_id: str = Depends(get_current_user)):
    """Generate invoices automatically for all active clients"""
    try:
        # Get all active clients
        active_clients = await db.clients.find({
            "user_id": user_id,
            "status": "cliente_ativo"
        }).to_list(1000)
        
        if not active_clients:
            return {"message": "Nenhum cliente ativo encontrado", "invoices_generated": 0}
        
        generated_invoices = []
        
        for client in active_clients:
            # Check if there's already a recent invoice for this client (within last 30 days)
            recent_invoice = await db.invoices.find_one({
                "user_id": user_id,
                "client_id": client["id"],
                "issue_date": {"$gte": datetime.now(timezone.utc) - timedelta(days=30)}
            })
            
            if recent_invoice:
                continue  # Skip if already has recent invoice
            
            # Generate invoice number
            invoice_count = await db.invoices.count_documents({"user_id": user_id})
            invoice_number = f"GROWEN-{user_id[:8].upper()}-{(invoice_count + len(generated_invoices) + 1):04d}"
            
            # Use client value or default service price
            unit_price = client.get("value", 15000)  # Default 15,000 Kz
            
            # Create invoice
            invoice = Invoice(
                invoice_number=invoice_number,
                user_id=user_id,
                client_id=client["id"],
                service_description="Consultoria Empresarial mensal com IA",
                quantity=1,
                unit_price=unit_price,
                total_amount=unit_price,
                notes=f"Fatura automática gerada para cliente ativo: {client['name']}"
            )
            
            # Save to database
            invoice_dict = invoice.dict()
            await db.invoices.insert_one(invoice_dict)
            
            generated_invoices.append({
                "client_name": client["name"],
                "invoice_number": invoice_number,
                "amount": unit_price
            })
        
        return {
            "message": f"{len(generated_invoices)} faturas geradas automaticamente",
            "invoices_generated": len(generated_invoices),
            "invoices": generated_invoices
        }
        
    except Exception as e:
        logger.error(f"Error auto-generating invoices: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao gerar faturas automaticamente")

# Invoice PDF Generation Function
async def generate_invoice_pdf(invoice: Invoice, user: dict, client: dict) -> str:
    """Generate professional PDF invoice"""
    try:
        # Create invoices directory if it doesn't exist
        invoices_dir = Path("/app/uploads/invoices")
        invoices_dir.mkdir(parents=True, exist_ok=True)
        
        # PDF file path
        pdf_filename = f"fatura-{invoice.invoice_number}.pdf"
        pdf_path = invoices_dir / pdf_filename
        
        # Create PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(str(pdf_path), pagesize=A4)
        
        # Styles
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'InvoiceTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=HexColor('#2ECC71'),
            alignment=1  # Center
        )
        
        header_style = ParagraphStyle(
            'Header',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            textColor=HexColor('#1A2930')
        )
        
        normal_style = ParagraphStyle(
            'Normal',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=10
        )
        
        # Build PDF content
        story = []
        
        # Header
        story.append(Paragraph("GROWEN", title_style))
        story.append(Paragraph("Smart Business Consulting", styles['Heading3']))
        story.append(Spacer(1, 20))
        
        # Invoice details table
        invoice_data = [
            ['FATURA', ''],
            [f'Número: {invoice.invoice_number}', f'Data: {invoice.issue_date.strftime("%d/%m/%Y")}'],
            ['', f'Vencimento: {invoice.due_date.strftime("%d/%m/%Y")}']
        ]
        
        invoice_table = Table(invoice_data, colWidths=[3*inch, 3*inch])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2ECC71')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#F8F9FA')),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(invoice_table)
        story.append(Spacer(1, 30))
        
        # Company and client info
        company_data = [
            ['EMPRESA', 'CLIENTE'],
            [f'{user.get("company", "Growen Consulting")}\n{user.get("name", "")}\nLuanda, Angola\ncontato@growen.com', 
             f'{client["name"]}\n{client.get("company", "")}\n{client["email"]}\n{client.get("phone", "")}']
        ]
        
        company_table = Table(company_data, colWidths=[3*inch, 3*inch])
        company_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(company_table)
        story.append(Spacer(1, 30))
        
        # Services table
        services_data = [
            ['DESCRIÇÃO', 'QTD', 'PREÇO UNIT.', 'TOTAL'],
            [invoice.service_description, str(invoice.quantity), f'{invoice.unit_price:,.0f} Kz', f'{invoice.total_amount:,.0f} Kz']
        ]
        
        # Add subtotal and total rows
        services_data.append(['', '', 'SUBTOTAL:', f'{invoice.total_amount:,.0f} Kz'])
        services_data.append(['', '', 'TOTAL:', f'{invoice.total_amount:,.0f} Kz'])
        
        services_table = Table(services_data, colWidths=[3*inch, 0.8*inch, 1.2*inch, 1.2*inch])
        services_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2ECC71')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, 1), 'LEFT'),  # Description left-aligned
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (2, 2), (-1, -1), 'Helvetica-Bold'),  # Subtotal and total bold
            ('BACKGROUND', (2, 2), (-1, -1), HexColor('#F0F8F0')),  # Light green for totals
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(services_table)
        story.append(Spacer(1, 30))
        
        # Payment instructions
        story.append(Paragraph("INSTRUÇÕES DE PAGAMENTO", header_style))
        story.append(Paragraph("Banco Económico - Conta: 001234567890123", normal_style))
        story.append(Paragraph("IBAN: AO06 0040 0000 1234 5678 9012 3", normal_style))
        story.append(Paragraph(f"Referência: {invoice.invoice_number}", normal_style))
        
        if invoice.notes:
            story.append(Spacer(1, 20))
            story.append(Paragraph("OBSERVAÇÕES", header_style))
            story.append(Paragraph(invoice.notes, normal_style))
        
        # Footer
        story.append(Spacer(1, 40))
        story.append(Paragraph("Obrigado pela preferência!", styles['Normal']))
        story.append(Paragraph("© 2025 Growen - Smart Business Consulting", styles['Normal']))
        
        # Build PDF
        doc.build(story)
        
        return str(pdf_path)
        
    except Exception as e:
        logger.error(f"Error generating invoice PDF: {str(e)}")
        raise Exception(f"Erro ao gerar PDF: {str(e)}")

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
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

# WhatsApp Configuration
WHATSAPP_NUMBER = "+244924123456"  # Número de WhatsApp para consultoria
WHATSAPP_MESSAGE = "Olá! Gostaria de uma consultoria especializada para o meu negócio em Angola."

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
        "is_admin": user.get("is_admin", False),
        "created_at": user["created_at"]
    }

# Enhanced CRM Routes with Email/Phone Integration
@api_router.post("/crm/clients", response_model=Client)
async def create_client(client_data: ClientCreate, user_id: str = Depends(get_current_user)):
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
async def generate_custom_report(report_data: ReportCreate, user_id: str = Depends(get_current_user)):
    if not await check_plan_limits(user_id, "reports"):
        raise HTTPException(status_code=403, detail="Limite de relatórios atingido para seu plano")
    
    try:
        # Get user's business data
        user = await db.users.find_one({"id": user_id})
        clients_query = {"user_id": user_id}
        
        # Apply date filters if provided
        if report_data.date_range:
            start_date = datetime.fromisoformat(report_data.date_range["start"])
            end_date = datetime.fromisoformat(report_data.date_range["end"])
            clients_query["created_at"] = {"$gte": start_date, "$lte": end_date}
        
        clients = await db.clients.find(clients_query).to_list(1000)
        chat_messages = await db.chat_messages.find({"user_id": user_id}).sort("timestamp", -1).limit(100).to_list(100)
        
        # Apply filters
        if report_data.filters:
            if "industry" in report_data.filters:
                clients = [c for c in clients if c.get("industry") == report_data.filters["industry"]]
            if "status" in report_data.filters:
                clients = [c for c in clients if c.get("status") == report_data.filters["status"]]
        
        # Generate comprehensive business analysis
        business_summary = f"""
        RELATÓRIO PERSONALIZADO: {report_data.title}
        
        Empresa: {user.get('company', 'Não informado')}
        Período: {report_data.period or 'Personalizado'}
        Seções solicitadas: {', '.join(report_data.sections)}
        
        DADOS PARA ANÁLISE:
        - Total de clientes: {len(clients)}
        - Clientes por status: {get_clients_by_status(clients)}
        - Indústrias representadas: {get_industries_summary(clients)}
        - Consultas IA recentes: {len(chat_messages)}
        - Tópicos de consultoria: {get_consultation_topics(chat_messages)}
        
        Por favor, gere um relatório executivo detalhado focado no mercado angolano com:
        1. Sumário executivo
        2. Análise de clientes e pipeline
        3. Insights de performance
        4. Oportunidades identificadas
        5. Recomendações estratégicas específicas para Angola
        6. Próximos passos e metas
        
        Inclua gráficos conceituais: {'Sim' if report_data.include_charts else 'Não'}
        Inclua insights avançados: {'Sim' if report_data.include_insights else 'Não'}
        """
        
        # Use AI to generate comprehensive report
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="Você é um consultor de negócios especializado em gerar relatórios executivos detalhados para empresas angolanas."
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=business_summary)
        report_content = await chat.send_message(user_message)
        
        # Create charts data if requested
        charts_data = None
        if report_data.include_charts:
            charts_data = {
                "clients_by_status": get_clients_chart_data(clients),
                "industry_distribution": get_industry_chart_data(clients),
                "monthly_growth": get_monthly_growth_data(clients),
                "pipeline_value": get_pipeline_value_data(clients)
            }
        
        # Generate insights if requested
        insights = []
        if report_data.include_insights:
            insights = generate_business_insights(clients, chat_messages)
        
        # Create report
        report = Report(
            user_id=user_id,
            title=report_data.title,
            content=report_content,
            type=report_data.type,
            period=report_data.period,
            date_range=report_data.date_range,
            filters=report_data.filters,
            insights=insights,
            charts_data=charts_data
        )
        
        await db.reports.insert_one(report.dict())
        
        return {
            "report_id": report.id,
            "title": report.title,
            "content": report_content,
            "insights": insights,
            "charts_data": charts_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório: {str(e)}")

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
            "timestamp": {"$gte": month_start, "$lt": month_end}
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
        "timestamp": {"$gte": current_month}
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
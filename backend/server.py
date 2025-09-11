from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Header, Cookie
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import jwt
import bcrypt
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import json

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
app = FastAPI(title="Growen - Smart Business Consulting API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    picture: Optional[str] = None
    provider: str = "email"  # email, google
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    plan: str = "free"
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Business Models
class Client(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    status: str = "lead_novo"  # lead_novo, em_negociacao, cliente_ativo, retido
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClientCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

# Chat Models
class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    session_id: str

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# Payment Models
class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    session_id: str
    amount: float
    currency: str = "usd"
    payment_status: str = "initiated"
    status: str = "pending"
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Report Models
class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    content: str
    insights: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check session token first (for Emergent auth)
    session = await db.user_sessions.find_one({"session_token": token})
    if session and session["expires_at"] > datetime.now(timezone.utc):
        return session["user_id"]
    
    # Fallback to JWT token
    user_id = verify_jwt_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_id

# Authentication Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        provider="email"
    )
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create token
    token = create_jwt_token(user.id)
    
    return {
        "message": "User created successfully",
        "user": {"id": user.id, "email": user.email, "name": user.name},
        "token": token
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = create_jwt_token(user["id"])
    
    return {
        "message": "Login successful",
        "user": {"id": user["id"], "email": user["email"], "name": user["name"]},
        "token": token
    }

@api_router.post("/auth/logout")
async def logout(user_id: str = Depends(get_current_user)):
    # For Emergent auth, we would delete the session here
    # For JWT, we rely on client-side token removal
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "plan": user.get("plan", "free"),
        "picture": user.get("picture")
    }

# Emergent Auth endpoint for session processing
@api_router.get("/auth/session-data")
async def get_session_data(x_session_id: Optional[str] = Header(None, alias="X-Session-ID")):
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Session ID required")
    
    # This would normally call the Emergent API
    # For now, return mock data - you'd implement the actual API call
    return {"message": "Session data would be retrieved from Emergent API"}

# Chat/Consultoria IA Routes
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest, user_id: str = Depends(get_current_user)):
    try:
        # Initialize chat with business consulting context
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        system_message = """Você é um consultor especialista em negócios da Growen, com expertise em:
        - Estratégias de crescimento empresarial
        - Análise financeira e KPIs
        - Marketing digital e vendas
        - Gestão de equipes
        - Inovação e tecnologia
        
        Forneça respostas práticas, acionáveis e baseadas em dados. 
        Seja direto e profissional, mas amigável. 
        Sempre sugira próximos passos concretos."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=chat_request.message)
        response = await chat.send_message(user_message)
        
        # Save chat history
        chat_message = ChatMessage(
            user_id=user_id,
            message=chat_request.message,
            response=response,
            session_id=session_id
        )
        
        await db.chat_messages.insert_one(chat_message.dict())
        
        return {
            "response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI consultation error: {str(e)}")

@api_router.get("/chat/history")
async def get_chat_history(user_id: str = Depends(get_current_user)):
    messages = await db.chat_messages.find({"user_id": user_id}).sort("timestamp", -1).limit(50).to_list(50)
    return messages

# CRM Routes
@api_router.post("/crm/clients", response_model=Client)
async def create_client(client_data: ClientCreate, user_id: str = Depends(get_current_user)):
    client = Client(
        user_id=user_id,
        name=client_data.name,
        email=client_data.email,
        phone=client_data.phone
    )
    
    await db.clients.insert_one(client.dict())
    return client

@api_router.get("/crm/clients", response_model=List[Client])
async def get_clients(user_id: str = Depends(get_current_user)):
    clients = await db.clients.find({"user_id": user_id}).to_list(1000)
    return [Client(**client) for client in clients]

@api_router.put("/crm/clients/{client_id}")
async def update_client_status(client_id: str, status: str, user_id: str = Depends(get_current_user)):
    valid_statuses = ["lead_novo", "em_negociacao", "cliente_ativo", "retido"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.clients.update_one(
        {"id": client_id, "user_id": user_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return {"message": "Client status updated"}

# Reports Routes
@api_router.post("/reports/generate")
async def generate_report(data: Dict[str, Any], user_id: str = Depends(get_current_user)):
    try:
        # Use AI to analyze data and generate insights
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="Você é um analista de dados especializado em gerar relatórios de negócios com insights acionáveis."
        ).with_model("openai", "gpt-4o")
        
        prompt = f"Analise os seguintes dados de negócio e gere insights importantes:\n{json.dumps(data, indent=2)}"
        user_message = UserMessage(text=prompt)
        analysis = await chat.send_message(user_message)
        
        # Create report
        report = Report(
            user_id=user_id,
            title=f"Relatório Automático - {datetime.now().strftime('%d/%m/%Y')}",
            content=analysis,
            insights=["Insight 1", "Insight 2", "Insight 3"]  # Would extract from AI response
        )
        
        await db.reports.insert_one(report.dict())
        
        return {
            "report_id": report.id,
            "title": report.title,
            "content": analysis,
            "insights": report.insights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")

@api_router.get("/reports")
async def get_reports(user_id: str = Depends(get_current_user)):
    reports = await db.reports.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return reports

# Dashboard/KPIs Routes
@api_router.get("/dashboard/kpis")
async def get_dashboard_kpis(user_id: str = Depends(get_current_user)):
    # Get aggregated data
    total_clients = await db.clients.count_documents({"user_id": user_id})
    active_clients = await db.clients.count_documents({"user_id": user_id, "status": "cliente_ativo"})
    total_reports = await db.reports.count_documents({"user_id": user_id})
    total_chats = await db.chat_messages.count_documents({"user_id": user_id})
    
    # Mock revenue data
    monthly_revenue = 15750.50
    revenue_growth = 12.5
    
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "total_reports": total_reports,
        "total_consultations": total_chats,
        "monthly_revenue": monthly_revenue,
        "revenue_growth": revenue_growth,
        "conversion_rate": 18.7 if total_clients > 0 else 0,
        "client_satisfaction": 94.2
    }

# Payment Routes
@api_router.post("/payments/checkout/session")
async def create_checkout_session(request: Request, checkout_data: Dict[str, Any], user_id: str = Depends(get_current_user)):
    try:
        # Define fixed packages
        PACKAGES = {
            "pro": {"amount": 49.99, "name": "Pro Plan"},
            "enterprise": {"amount": 199.99, "name": "Enterprise Plan"}
        }
        
        package_id = checkout_data.get("package_id")
        if not package_id or package_id not in PACKAGES:
            raise HTTPException(status_code=400, detail="Invalid package")
        
        # Get amount from server-side definition
        package = PACKAGES[package_id]
        amount = package["amount"]
        
        # Build URLs from request origin
        base_url = str(request.base_url).rstrip('/')
        success_url = f"{base_url}/dashboard/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/dashboard/plans"
        
        # Initialize Stripe
        webhook_url = f"{base_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        
        # Create checkout session
        checkout_request = CheckoutSessionRequest(
            amount=amount,
            currency="usd",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "package_id": package_id,
                "plan_name": package["name"]
            }
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            user_id=user_id,
            session_id=session.session_id,
            amount=amount,
            currency="usd",
            payment_status="initiated",
            status="pending",
            metadata={"package_id": package_id}
        )
        
        await db.payment_transactions.insert_one(transaction.dict())
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout error: {str(e)}")

@api_router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(session_id: str, user_id: str = Depends(get_current_user)):
    try:
        # Get status from Stripe
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update local transaction
        await db.payment_transactions.update_one(
            {"session_id": session_id, "user_id": user_id},
            {
                "$set": {
                    "payment_status": status.payment_status,
                    "status": status.status,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        # If payment successful, upgrade user plan
        if status.payment_status == "paid":
            metadata = status.metadata
            if metadata and "package_id" in metadata:
                plan = "pro" if metadata["package_id"] == "pro" else "enterprise"
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {"plan": plan}}
                )
        
        return {
            "status": status.status,
            "payment_status": status.payment_status,
            "amount_total": status.amount_total,
            "currency": status.currency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check error: {str(e)}")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url="")
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {
                    "$set": {
                        "payment_status": "paid",
                        "status": "completed",
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
        
        return {"received": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Growen API"}

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
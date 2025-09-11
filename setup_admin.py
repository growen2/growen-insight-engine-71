#!/usr/bin/env python3
"""
Script para configurar usuário como administrador
"""
import asyncio
import sys
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env do backend
backend_env = Path(__file__).parent / 'backend' / '.env'
load_dotenv(backend_env)

async def setup_admin(email):
    """Configura um usuário como administrador"""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ.get('DB_NAME', 'growen_db')]
    
    try:
        # Encontra o usuário pelo email
        user = await db.users.find_one({'email': email})
        
        if user:
            # Torna o usuário admin
            await db.users.update_one(
                {'email': email},
                {'$set': {'is_admin': True}}
            )
            print(f'✅ Usuário {email} agora é administrador!')
            print(f'👤 Nome: {user.get("name", "N/A")}')
            print(f'🆔 ID: {user.get("id", "N/A")}')
            print(f'🌐 Acesse: http://localhost:3000/admin')
            return True
        else:
            print(f'❌ Usuário {email} não encontrado!')
            print('💡 Certifique-se de que o usuário já está registrado na plataforma')
            return False
            
    except Exception as e:
        print(f'❌ Erro: {str(e)}')
        return False
    finally:
        client.close()

async def list_users():
    """Lista todos os usuários para ajudar a identificar emails"""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ.get('DB_NAME', 'growen_db')]
    
    try:
        users = await db.users.find({}, {'email': 1, 'name': 1, 'is_admin': 1}).to_list(100)
        
        if users:
            print("\n📋 USUÁRIOS REGISTRADOS:")
            print("-" * 50)
            for user in users:
                admin_status = "👑 ADMIN" if user.get('is_admin') else "👤 USER"
                print(f"{admin_status} | {user.get('name', 'N/A')} | {user.get('email', 'N/A')}")
            print("-" * 50)
        else:
            print('❌ Nenhum usuário encontrado')
            
    except Exception as e:
        print(f'❌ Erro ao listar usuários: {str(e)}')
    finally:
        client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == 'list':
            asyncio.run(list_users())
        else:
            email = sys.argv[1]
            asyncio.run(setup_admin(email))
    else:
        print("📋 USO:")
        print("  python3 setup_admin.py <email>     - Torna usuário admin")
        print("  python3 setup_admin.py list        - Lista todos os usuários")
        print("")
        print("📝 EXEMPLOS:")
        print("  python3 setup_admin.py admin@growen.com")
        print("  python3 setup_admin.py list")
#!/usr/bin/env python3
"""
Critical Bug Fixes Testing for Growen Platform
Tests specific bugs reported by user:
1. Payment and Plan Changes
2. User Profile Updates  
3. CRM Lead Creation
4. Invoice Generation System
"""

import requests
import json
import os
import time
from pathlib import Path
import tempfile
from io import BytesIO

# Configuration
BASE_URL = "https://growen-consult.preview.emergentagent.com/api"
import time
TEST_USER_EMAIL = f"bugtest{int(time.time())}@growen.com"
TEST_USER_PASSWORD = "testpass123"
TEST_USER_NAME = "Bug Test User"
TEST_COMPANY = "Bug Test Company Angola"

# Global variables for test data
user_token = None
user_id = None
test_client_id = None
test_invoice_id = None
current_password = TEST_USER_PASSWORD

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def make_request(method, endpoint, data=None, files=None, headers=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=30)
        elif method.upper() == "POST":
            if files:
                response = requests.post(url, data=data, files=files, headers=headers, timeout=30)
            else:
                response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=30)
        elif method.upper() == "DELETE":
            response = requests.delete(url, headers=headers, timeout=30)
        else:
            return None, f"Unsupported method: {method}"
        
        return response, None
    except requests.exceptions.RequestException as e:
        return None, str(e)

def setup_test_user():
    """Setup test user for testing"""
    print("🔐 Setting up test user...")
    
    # Try registration first
    user_data = {
        "email": TEST_USER_EMAIL,
        "name": TEST_USER_NAME,
        "password": TEST_USER_PASSWORD,
        "company": TEST_COMPANY,
        "phone": "+244924123456",
        "industry": "Tecnologia"
    }
    
    response, error = make_request("POST", "/auth/register", user_data)
    
    if response and (response.status_code == 200 or response.status_code == 201):
        try:
            data = response.json()
            global user_token, user_id
            user_token = data.get("token")
            user_id = data.get("user", {}).get("id")
            
            if user_token and user_id:
                print_test_result("User Setup (Registration)", True, f"User created with ID: {user_id}")
                return True
        except:
            pass
    
    # Try login if registration failed
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    
    response, error = make_request("POST", "/auth/login", login_data)
    
    if response and response.status_code == 200:
        try:
            data = response.json()
            user_token = data.get("token")
            user_id = data.get("user", {}).get("id")
            
            if user_token and user_id:
                print_test_result("User Setup (Login)", True, f"User logged in with ID: {user_id}")
                return True
        except:
            pass
    
    print_test_result("User Setup", False, "Could not create or login test user")
    return False

# BUG FIX TESTS

def test_user_profile_update():
    """Test PUT /api/auth/profile - reported bug: users can't change account info"""
    print("👤 Testing User Profile Update (BUG FIX)...")
    
    if not user_token:
        print_test_result("User Profile Update", False, "No user token available")
        return False
    
    profile_data = {
        "name": "Updated Bug Test User",
        "company": "Updated Bug Test Company",
        "phone": "+244925123456",
        "industry": "Consultoria"
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("PUT", "/auth/profile", profile_data, headers=headers)
    
    if error:
        print_test_result("User Profile Update", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "message" in data and "sucesso" in data["message"].lower():
                print_test_result("User Profile Update", True, "Profile updated successfully")
                return True
            else:
                print_test_result("User Profile Update", False, f"Unexpected response: {data}")
                return False
        except json.JSONDecodeError:
            print_test_result("User Profile Update", False, "Invalid JSON response")
            return False
    else:
        print_test_result("User Profile Update", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_password_change():
    """Test POST /api/auth/change-password - reported bug: password change not working"""
    print("🔒 Testing Password Change (BUG FIX)...")
    
    if not user_token:
        print_test_result("Password Change", False, "No user token available")
        return False
    
    global current_password
    password_data = {
        "current_password": current_password,
        "new_password": "newpassword123"
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("POST", "/auth/change-password", password_data, headers=headers)
    
    if error:
        print_test_result("Password Change", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "message" in data and "sucesso" in data["message"].lower():
                print_test_result("Password Change", True, "Password changed successfully")
                # Update global password for future tests
                current_password = "newpassword123"
                return True
            else:
                print_test_result("Password Change", False, f"Unexpected response: {data}")
                return False
        except json.JSONDecodeError:
            print_test_result("Password Change", False, "Invalid JSON response")
            return False
    else:
        print_test_result("Password Change", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_crm_client_creation():
    """Test POST /api/crm/clients - reported bug: lead creation issues"""
    print("👥 Testing CRM Client Creation (BUG FIX)...")
    
    if not user_token:
        print_test_result("CRM Client Creation", False, "No user token available")
        return False
    
    client_data = {
        "name": "Maria Santos",
        "email": "maria.santos@empresa.ao",
        "phone": "+244923456789",
        "company": "Santos Enterprises",
        "industry": "Agricultura",
        "value": 75000,
        "notes": "Lead interessado em consultoria agrícola"
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("POST", "/crm/clients", client_data, headers=headers)
    
    if error:
        print_test_result("CRM Client Creation", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            global test_client_id
            test_client_id = data.get("id")
            
            if test_client_id and data.get("name") == client_data["name"]:
                print_test_result("CRM Client Creation", True, f"Client created with ID: {test_client_id}")
                return True
            else:
                print_test_result("CRM Client Creation", False, "Missing client ID or incorrect data in response")
                return False
        except json.JSONDecodeError:
            print_test_result("CRM Client Creation", False, "Invalid JSON response")
            return False
    else:
        print_test_result("CRM Client Creation", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_crm_client_listing():
    """Test GET /api/crm/clients - reported bug: client listing issues"""
    print("📋 Testing CRM Client Listing (BUG FIX)...")
    
    if not user_token:
        print_test_result("CRM Client Listing", False, "No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("GET", "/crm/clients", headers=headers)
    
    if error:
        print_test_result("CRM Client Listing", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print_test_result("CRM Client Listing", True, f"Retrieved {len(data)} clients")
                return True
            else:
                print_test_result("CRM Client Listing", False, "Response is not a list")
                return False
        except json.JSONDecodeError:
            print_test_result("CRM Client Listing", False, "Invalid JSON response")
            return False
    else:
        print_test_result("CRM Client Listing", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_crm_client_update():
    """Test PUT /api/crm/clients/{client_id} - reported bug: client update issues"""
    print("✏️ Testing CRM Client Update (BUG FIX)...")
    
    if not user_token or not test_client_id:
        print_test_result("CRM Client Update", False, "No user token or client ID available")
        return False
    
    update_data = {
        "status": "em_negociacao",
        "value": 85000,
        "notes": "Cliente em negociação avançada - proposta enviada"
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("PUT", f"/crm/clients/{test_client_id}", update_data, headers=headers)
    
    if error:
        print_test_result("CRM Client Update", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "message" in data and "sucesso" in data["message"].lower():
                print_test_result("CRM Client Update", True, "Client updated successfully")
                return True
            else:
                print_test_result("CRM Client Update", False, f"Unexpected response: {data}")
                return False
        except json.JSONDecodeError:
            print_test_result("CRM Client Update", False, "Invalid JSON response")
            return False
    else:
        print_test_result("CRM Client Update", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_payment_proof_upload():
    """Test POST /api/payments/upload-proof - reported bug: payment upload issues"""
    print("💳 Testing Payment Proof Upload (BUG FIX)...")
    
    if not user_token:
        print_test_result("Payment Proof Upload", False, "No user token available")
        return False
    
    # Create a test image file
    test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01IEND\xaeB`\x82'
    
    files = {
        'file': ('payment_receipt.png', BytesIO(test_image_content), 'image/png')
    }
    
    data = {
        'plan_id': 'starter',
        'reference_number': 'BUG-TEST-12345',
        'notes': 'Test payment upload for bug fix validation'
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("POST", "/payments/upload-proof", data=data, files=files, headers=headers)
    
    if error:
        print_test_result("Payment Proof Upload", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            payment_id = data.get("payment_id")
            
            if payment_id and data.get("status") == "pending":
                print_test_result("Payment Proof Upload", True, f"Payment uploaded successfully, ID: {payment_id}")
                return True
            else:
                print_test_result("Payment Proof Upload", False, "Missing payment_id or incorrect status")
                return False
        except json.JSONDecodeError:
            print_test_result("Payment Proof Upload", False, "Invalid JSON response")
            return False
    else:
        print_test_result("Payment Proof Upload", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_plan_upgrade():
    """Test POST /api/plans/upgrade - reported bug: plan upgrade issues"""
    print("⬆️ Testing Plan Upgrade (BUG FIX)...")
    
    if not user_token:
        print_test_result("Plan Upgrade", False, "No user token available")
        return False
    
    upgrade_data = {
        "plan_id": "starter"
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("POST", "/plans/upgrade", upgrade_data, headers=headers)
    
    if error:
        print_test_result("Plan Upgrade", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "message" in data:
                print_test_result("Plan Upgrade", True, f"Plan upgrade response: {data['message']}")
                return True
            else:
                print_test_result("Plan Upgrade", False, f"Unexpected response: {data}")
                return False
        except json.JSONDecodeError:
            print_test_result("Plan Upgrade", False, "Invalid JSON response")
            return False
    elif response.status_code == 404:
        print_test_result("Plan Upgrade", False, "Endpoint not found - may not be implemented")
        return False
    else:
        print_test_result("Plan Upgrade", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_current_plan():
    """Test GET /api/plans/current - reported bug: plan info retrieval issues"""
    print("📋 Testing Current Plan Info (BUG FIX)...")
    
    if not user_token:
        print_test_result("Current Plan Info", False, "No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("GET", "/plans/current", headers=headers)
    
    if error:
        print_test_result("Current Plan Info", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "name" in data and "limits" in data:
                print_test_result("Current Plan Info", True, f"Current plan: {data.get('name')}")
                return True
            else:
                print_test_result("Current Plan Info", False, f"Missing plan info in response: {data}")
                return False
        except json.JSONDecodeError:
            print_test_result("Current Plan Info", False, "Invalid JSON response")
            return False
    elif response.status_code == 404:
        print_test_result("Current Plan Info", False, "Endpoint not found - may not be implemented")
        return False
    else:
        print_test_result("Current Plan Info", False, f"HTTP {response.status_code}: {response.text}")
        return False

# NEW FEATURE TESTS - Invoice Generation System

def test_manual_invoice_generation():
    """Test POST /api/invoices/generate - new feature"""
    print("🧾 Testing Manual Invoice Generation (NEW FEATURE)...")
    
    if not user_token or not test_client_id:
        print_test_result("Manual Invoice Generation", False, "No user token or client ID available")
        return False
    
    # First, update client status to "cliente_ativo" to allow invoice generation
    update_data = {
        "status": "cliente_ativo"
    }
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("PUT", f"/crm/clients/{test_client_id}", update_data, headers=headers)
    
    if not response or response.status_code != 200:
        print_test_result("Manual Invoice Generation", False, "Could not update client status to active")
        return False
    
    # Now generate invoice
    invoice_data = {
        "client_id": test_client_id,
        "service_description": "Consultoria Empresarial Especializada",
        "quantity": 1,
        "unit_price": 50000,
        "notes": "Consultoria para otimização de processos"
    }
    
    response, error = make_request("POST", "/invoices/generate", invoice_data, headers=headers)
    
    if error:
        print_test_result("Manual Invoice Generation", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            global test_invoice_id
            test_invoice_id = data.get("invoice_id")
            
            if test_invoice_id and "message" in data:
                print_test_result("Manual Invoice Generation", True, f"Invoice generated with ID: {test_invoice_id}")
                return True
            else:
                print_test_result("Manual Invoice Generation", False, "Missing invoice_id or message in response")
                return False
        except json.JSONDecodeError:
            print_test_result("Manual Invoice Generation", False, "Invalid JSON response")
            return False
    elif response.status_code == 404:
        print_test_result("Manual Invoice Generation", False, "Endpoint not found - may not be implemented")
        return False
    else:
        print_test_result("Manual Invoice Generation", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_auto_invoice_generation():
    """Test POST /api/invoices/auto-generate - new feature"""
    print("🤖 Testing Auto Invoice Generation (NEW FEATURE)...")
    
    if not user_token:
        print_test_result("Auto Invoice Generation", False, "No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("POST", "/invoices/auto-generate", headers=headers)
    
    if error:
        print_test_result("Auto Invoice Generation", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if "message" in data:
                print_test_result("Auto Invoice Generation", True, f"Auto generation response: {data['message']}")
                return True
            else:
                print_test_result("Auto Invoice Generation", False, f"Unexpected response: {data}")
                return False
        except json.JSONDecodeError:
            print_test_result("Auto Invoice Generation", False, "Invalid JSON response")
            return False
    elif response.status_code == 404:
        print_test_result("Auto Invoice Generation", False, "Endpoint not found - may not be implemented")
        return False
    else:
        print_test_result("Auto Invoice Generation", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_invoice_listing():
    """Test GET /api/invoices - new feature"""
    print("📋 Testing Invoice Listing (NEW FEATURE)...")
    
    if not user_token:
        print_test_result("Invoice Listing", False, "No user token available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("GET", "/invoices", headers=headers)
    
    if error:
        print_test_result("Invoice Listing", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        try:
            data = response.json()
            if isinstance(data, list):
                print_test_result("Invoice Listing", True, f"Retrieved {len(data)} invoices")
                return True
            else:
                print_test_result("Invoice Listing", False, "Response is not a list")
                return False
        except json.JSONDecodeError:
            print_test_result("Invoice Listing", False, "Invalid JSON response")
            return False
    elif response.status_code == 404:
        print_test_result("Invoice Listing", False, "Endpoint not found - may not be implemented")
        return False
    else:
        print_test_result("Invoice Listing", False, f"HTTP {response.status_code}: {response.text}")
        return False

def test_invoice_pdf_download():
    """Test GET /api/invoices/{invoice_id}/pdf - new feature"""
    print("📄 Testing Invoice PDF Download (NEW FEATURE)...")
    
    if not user_token or not test_invoice_id:
        print_test_result("Invoice PDF Download", False, "No user token or invoice ID available")
        return False
    
    headers = {"Authorization": f"Bearer {user_token}"}
    response, error = make_request("GET", f"/invoices/{test_invoice_id}/pdf", headers=headers)
    
    if error:
        print_test_result("Invoice PDF Download", False, f"Request failed: {error}")
        return False
    
    if response.status_code == 200:
        if response.headers.get('content-type') == 'application/pdf':
            print_test_result("Invoice PDF Download", True, f"PDF downloaded successfully, size: {len(response.content)} bytes")
            return True
        else:
            print_test_result("Invoice PDF Download", False, "Response is not a PDF")
            return False
    elif response.status_code == 404:
        print_test_result("Invoice PDF Download", False, "Endpoint or invoice not found")
        return False
    else:
        print_test_result("Invoice PDF Download", False, f"HTTP {response.status_code}: {response.text}")
        return False

def run_critical_bug_tests():
    """Run all critical bug fix tests"""
    print("🚨 Starting Critical Bug Fixes Testing Suite")
    print("=" * 60)
    
    # Setup
    if not setup_test_user():
        print("❌ Could not setup test user. Aborting tests.")
        return
    
    test_results = []
    
    # User Profile Management Bug Fixes
    print("\n👤 USER PROFILE MANAGEMENT BUG FIXES")
    print("-" * 40)
    test_results.append(("User Profile Update", test_user_profile_update()))
    test_results.append(("Password Change", test_password_change()))
    
    # CRM Lead Creation Bug Fixes
    print("\n👥 CRM LEAD CREATION BUG FIXES")
    print("-" * 40)
    test_results.append(("CRM Client Creation", test_crm_client_creation()))
    test_results.append(("CRM Client Listing", test_crm_client_listing()))
    test_results.append(("CRM Client Update", test_crm_client_update()))
    
    # Payment System Bug Fixes
    print("\n💳 PAYMENT SYSTEM BUG FIXES")
    print("-" * 40)
    test_results.append(("Payment Proof Upload", test_payment_proof_upload()))
    test_results.append(("Plan Upgrade", test_plan_upgrade()))
    test_results.append(("Current Plan Info", test_current_plan()))
    
    # Invoice Generation System (New Feature)
    print("\n🧾 INVOICE GENERATION SYSTEM (NEW FEATURE)")
    print("-" * 40)
    test_results.append(("Manual Invoice Generation", test_manual_invoice_generation()))
    test_results.append(("Auto Invoice Generation", test_auto_invoice_generation()))
    test_results.append(("Invoice Listing", test_invoice_listing()))
    test_results.append(("Invoice PDF Download", test_invoice_pdf_download()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 CRITICAL BUG FIXES TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Success Rate: {(passed/len(test_results)*100):.1f}%")
    
    if failed > 0:
        print(f"\n⚠️  {failed} critical bug fixes still failing!")
        print("These issues need immediate attention:")
        for test_name, result in test_results:
            if not result:
                print(f"  - {test_name}")
    else:
        print(f"\n🎉 All critical bug fixes are working!")
    
    return passed, failed

if __name__ == "__main__":
    run_critical_bug_tests()
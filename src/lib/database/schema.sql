-- Growen Smart Business Consulting Database Schema
-- PostgreSQL Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_role AS ENUM ('admin', 'consultant', 'client', 'partner');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'cancelled', 'expired');
CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'premium');
CREATE TYPE lead_status AS ENUM ('novo', 'engajado', 'qualificado', 'convertido', 'perdido');
CREATE TYPE diagnostic_category AS ENUM ('excelente', 'ok', 'atencao', 'critico');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    industry TEXT,
    city_country TEXT,
    monthly_revenue DECIMAL(12,2),
    employees INTEGER,
    website_url TEXT,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL,
    status subscription_status DEFAULT 'trial',
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnostic forms table
CREATE TABLE public.diagnostic_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city_country TEXT,
    industry TEXT,
    monthly_revenue DECIMAL(12,2),
    fixed_costs TEXT[], -- JSON array of fixed costs
    employees INTEGER,
    lead_acquisition TEXT,
    has_website BOOLEAN,
    website_url TEXT,
    current_crm TEXT,
    goals_12m TEXT[], -- JSON array of goals
    interested_consulting BOOLEAN,
    comments TEXT,
    score INTEGER,
    category diagnostic_category,
    user_id UUID REFERENCES public.users(id),
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Reports table
CREATE TABLE public.ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diagnostic_form_id UUID REFERENCES public.diagnostic_forms(id),
    user_id UUID REFERENCES public.users(id),
    report_data JSONB NOT NULL, -- Contains all AI-generated report sections
    pdf_url TEXT,
    html_content TEXT,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM Contacts table
CREATE TABLE public.crm_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status lead_status DEFAULT 'novo',
    tags TEXT[],
    last_contact_date TIMESTAMP WITH TIME ZONE,
    next_follow_up TIMESTAMP WITH TIME ZONE,
    source TEXT,
    value DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing Campaigns table
CREATE TABLE public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT, -- email, whatsapp, social, etc.
    status TEXT DEFAULT 'draft', -- draft, active, paused, completed
    target_audience JSONB,
    content JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    stats JSONB, -- open rates, click rates, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academy Courses table
CREATE TABLE public.academy_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    content_url TEXT,
    duration_minutes INTEGER,
    difficulty_level TEXT, -- beginner, intermediate, advanced
    category TEXT,
    is_premium BOOLEAN DEFAULT false,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Course Progress table
CREATE TABLE public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    certificate_issued BOOLEAN DEFAULT false,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Marketplace Services table
CREATE TABLE public.marketplace_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.users(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'EUR',
    delivery_time_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    commission_rate DECIMAL(5,2) DEFAULT 15.00, -- percentage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Orders table
CREATE TABLE public.service_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.users(id),
    service_id UUID REFERENCES public.marketplace_services(id),
    partner_id UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    amount DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    stripe_payment_intent_id TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation Rules table
CREATE TABLE public.automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_type TEXT NOT NULL, -- form_submission, tag_added, payment_completed, etc.
    trigger_conditions JSONB,
    actions JSONB, -- array of actions to execute
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks Log table
CREATE TABLE public.webhooks_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id),
    webhook_type TEXT NOT NULL, -- stripe, whatsapp, hubspot, etc.
    payload JSONB,
    response_status INTEGER,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

-- Create RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own companies" ON public.companies FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostic forms" ON public.diagnostic_forms FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI reports" ON public.ai_reports FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own CRM contacts" ON public.crm_contacts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own campaigns" ON public.marketing_campaigns FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Academy courses are public" ON public.academy_courses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own course progress" ON public.user_course_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Marketplace services are public" ON public.marketplace_services FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Partners can manage own services" ON public.marketplace_services FOR ALL USING (auth.uid() = partner_id);

CREATE POLICY "Users can view own orders" ON public.service_orders FOR ALL USING (auth.uid() = client_id OR auth.uid() = partner_id);

CREATE POLICY "Users can manage own automation rules" ON public.automation_rules FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own webhook logs" ON public.webhooks_log FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_diagnostic_forms_user_id ON public.diagnostic_forms(user_id);
CREATE INDEX idx_diagnostic_forms_email ON public.diagnostic_forms(email);
CREATE INDEX idx_ai_reports_user_id ON public.ai_reports(user_id);
CREATE INDEX idx_crm_contacts_user_id ON public.crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_status ON public.crm_contacts(status);
CREATE INDEX idx_marketing_campaigns_user_id ON public.marketing_campaigns(user_id);
CREATE INDEX idx_user_course_progress_user_id ON public.user_course_progress(user_id);
CREATE INDEX idx_service_orders_client_id ON public.service_orders(client_id);
CREATE INDEX idx_service_orders_partner_id ON public.service_orders(partner_id);
CREATE INDEX idx_automation_rules_user_id ON public.automation_rules(user_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_academy_courses_updated_at BEFORE UPDATE ON public.academy_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplace_services_updated_at BEFORE UPDATE ON public.marketplace_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON public.service_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
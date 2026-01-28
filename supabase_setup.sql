
-- Tabela para registrar logs de pagamentos (Auditoria)
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    provider TEXT NOT NULL,
    payload JSONB,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS apenas para leitura pelo admin (service_role)
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

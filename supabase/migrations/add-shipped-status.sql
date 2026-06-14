-- Add 'shipped' to order_status enum
-- Run in Supabase SQL Editor if not already applied

ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'shipped';

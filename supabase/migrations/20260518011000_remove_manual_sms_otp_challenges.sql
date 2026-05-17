-- Supabase Auth owns SMS OTP code storage/verification.
-- Remove the earlier custom OTP challenge table so the app does not store OTP codes manually.

drop table if exists public.auth_otp_challenges;

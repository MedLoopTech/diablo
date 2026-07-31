-- Migration 28: add payment account details to referral_codes
-- Admin needs to know WHERE to send money when marking payouts paid.

ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS payment_method text
    CHECK (payment_method IN ('jazzcash', 'easypaisa', 'bank_transfer', 'other')),
  ADD COLUMN IF NOT EXISTS account_title  text,   -- account holder name
  ADD COLUMN IF NOT EXISTS account_number text;   -- mobile number or IBAN

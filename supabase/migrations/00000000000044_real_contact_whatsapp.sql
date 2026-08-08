-- Migration 42 seeded contact_whatsapp with a placeholder number carried
-- over from the original marketing HTML. Replaced with the real MedLoop
-- Technologies WhatsApp number (verified live on getmedloop.com's own
-- wa.me link) now that Loop/90's contact details are being reconciled with
-- the parent company's.
update public.automation_config
set value = '923396335667'
where key = 'contact_whatsapp' and value = '923452739406';

ALTER TABLE "achievements" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "bazi_calculations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "copyright_audit" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fengshui_analysis" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fraud_blacklist" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "fraud_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pdf_audit" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "referral_codes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "referral_relationships" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "share_clicks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "share_records" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "task_progress" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_referral_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "achievements" CASCADE;--> statement-breakpoint
DROP TABLE "bazi_calculations" CASCADE;--> statement-breakpoint
DROP TABLE "copyright_audit" CASCADE;--> statement-breakpoint
DROP TABLE "fengshui_analysis" CASCADE;--> statement-breakpoint
DROP TABLE "fraud_blacklist" CASCADE;--> statement-breakpoint
DROP TABLE "fraud_events" CASCADE;--> statement-breakpoint
DROP TABLE "pdf_audit" CASCADE;--> statement-breakpoint
DROP TABLE "referral_codes" CASCADE;--> statement-breakpoint
DROP TABLE "referral_relationships" CASCADE;--> statement-breakpoint
DROP TABLE "share_clicks" CASCADE;--> statement-breakpoint
DROP TABLE "share_records" CASCADE;--> statement-breakpoint
DROP TABLE "task_progress" CASCADE;--> statement-breakpoint
DROP TABLE "user_referral_stats" CASCADE;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "scene" text;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "invoice_id" text;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "payment_scene_idx" ON "payment" USING btree ("scene");--> statement-breakpoint
CREATE INDEX "payment_paid_idx" ON "payment" USING btree ("paid");--> statement-breakpoint
CREATE INDEX "payment_invoice_id_idx" ON "payment" USING btree ("invoice_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_invoice_id_unique" UNIQUE("invoice_id");
CREATE TABLE "bazi_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"input" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"credits_used" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "copyright_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fengshui_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"input" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"confidence" text DEFAULT '0.0' NOT NULL,
	"credits_used" integer DEFAULT 20 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pdf_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"file_key" text NOT NULL,
	"meta" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bazi_calculations" ADD CONSTRAINT "bazi_calculations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "copyright_audit" ADD CONSTRAINT "copyright_audit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fengshui_analysis" ADD CONSTRAINT "fengshui_analysis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pdf_audit" ADD CONSTRAINT "pdf_audit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bazi_user_id_idx" ON "bazi_calculations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "bazi_created_at_idx" ON "bazi_calculations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "copyright_audit_user_id_idx" ON "copyright_audit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "copyright_audit_created_at_idx" ON "copyright_audit" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "fengshui_user_id_idx" ON "fengshui_analysis" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "fengshui_created_at_idx" ON "fengshui_analysis" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pdf_audit_user_id_idx" ON "pdf_audit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pdf_audit_created_at_idx" ON "pdf_audit" USING btree ("created_at");
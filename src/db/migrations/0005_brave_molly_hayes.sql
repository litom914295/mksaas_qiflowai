CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_id" text NOT NULL,
	"achievement_name" text,
	"achievement_level" integer DEFAULT 1,
	"unlocked_at" timestamp DEFAULT now(),
	"reward_amount" integer
);
--> statement-breakpoint
CREATE TABLE "fraud_blacklist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" text,
	"fingerprint" text,
	"reason" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fraud_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_id" uuid NOT NULL,
	"ip" text,
	"fingerprint" text,
	"reason" text,
	"step" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referral_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"user_id" text NOT NULL,
	"custom_code" text,
	"usage_count" integer DEFAULT 0,
	"max_usage" integer,
	"total_rewards" integer DEFAULT 0,
	"expire_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referral_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" text NOT NULL,
	"referee_id" text NOT NULL,
	"referral_code" text,
	"level" integer DEFAULT 1,
	"status" text DEFAULT 'pending',
	"reward_granted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"activated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "share_clicks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"share_id" uuid NOT NULL,
	"ip" text,
	"user_agent" text,
	"fingerprint" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "share_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"share_type" text NOT NULL,
	"platform" text,
	"share_url" text,
	"click_count" integer DEFAULT 0,
	"conversion_count" integer DEFAULT 0,
	"reward_granted" boolean DEFAULT false,
	"reward_amount" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"task_id" text NOT NULL,
	"task_type" text,
	"progress" integer DEFAULT 0,
	"target" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"reward_claimed" boolean DEFAULT false,
	"completed_at" timestamp,
	"reset_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_referral_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"direct_referrals" integer DEFAULT 0,
	"indirect_referrals" integer DEFAULT 0,
	"total_referral_rewards" integer DEFAULT 0,
	"total_shares" integer DEFAULT 0,
	"total_share_clicks" integer DEFAULT 0,
	"total_share_conversions" integer DEFAULT 0,
	"referral_level" text,
	"last_referral_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_referral_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_codes" ADD CONSTRAINT "referral_codes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_referrer_id_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_relationships" ADD CONSTRAINT "referral_relationships_referee_id_user_id_fk" FOREIGN KEY ("referee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_records" ADD CONSTRAINT "share_records_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_progress" ADD CONSTRAINT "task_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referral_stats" ADD CONSTRAINT "user_referral_stats_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_achievement_user" ON "achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_achievement_unlocked" ON "achievements" USING btree ("unlocked_at");--> statement-breakpoint
CREATE INDEX "idx_fraud_ip" ON "fraud_blacklist" USING btree ("ip");--> statement-breakpoint
CREATE INDEX "idx_fraud_fp" ON "fraud_blacklist" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "idx_fraud_events_share" ON "fraud_events" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "idx_fraud_events_created" ON "fraud_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_code_user" ON "referral_codes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_code_code" ON "referral_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_code_custom" ON "referral_codes" USING btree ("custom_code");--> statement-breakpoint
CREATE INDEX "idx_referral_referrer" ON "referral_relationships" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "idx_referral_referee" ON "referral_relationships" USING btree ("referee_id");--> statement-breakpoint
CREATE INDEX "idx_referral_status" ON "referral_relationships" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referral_code" ON "referral_relationships" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_share_clicks_share" ON "share_clicks" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "idx_share_clicks_created" ON "share_clicks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_share_user" ON "share_records" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_share_type" ON "share_records" USING btree ("share_type");--> statement-breakpoint
CREATE INDEX "idx_share_user_type" ON "share_records" USING btree ("user_id","share_type");--> statement-breakpoint
CREATE INDEX "idx_share_created" ON "share_records" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_task_user" ON "task_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_task_type" ON "task_progress" USING btree ("task_type");--> statement-breakpoint
CREATE INDEX "idx_task_user_type" ON "task_progress" USING btree ("user_id","task_type");--> statement-breakpoint
CREATE INDEX "idx_task_reset" ON "task_progress" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "idx_stats_user" ON "user_referral_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_stats_level" ON "user_referral_stats" USING btree ("referral_level");
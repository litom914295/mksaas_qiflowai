CREATE TABLE "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"check_in_date" timestamp NOT NULL,
	"consecutive_days" integer DEFAULT 1 NOT NULL,
	"reward_credits" integer DEFAULT 2 NOT NULL,
	"milestone_reward" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_configs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "credit_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" integer NOT NULL,
	"name" text NOT NULL,
	"min_credits" integer NOT NULL,
	"color" text DEFAULT '#gray' NOT NULL,
	"icon" text,
	"benefits" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "credit_levels_level_unique" UNIQUE("level")
);
--> statement-breakpoint
CREATE TABLE "credit_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"reward_id" uuid NOT NULL,
	"cost" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"fulfillment_data" jsonb,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"fulfilled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "credit_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cost" integer NOT NULL,
	"stock" integer DEFAULT -1 NOT NULL,
	"image_url" text,
	"category" text DEFAULT 'other' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" text NOT NULL,
	"referred_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"progress" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"activated_at" timestamp,
	"reward_tier" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credits" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "successful_invites" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_invites" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_redemptions" ADD CONSTRAINT "credit_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_redemptions" ADD CONSTRAINT "credit_redemptions_reward_id_credit_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."credit_rewards"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_user_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_user_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_id_check_in_date_idx" ON "check_ins" USING btree ("user_id","check_in_date");--> statement-breakpoint
CREATE INDEX "check_in_date_idx" ON "check_ins" USING btree ("check_in_date");--> statement-breakpoint
CREATE INDEX "credit_config_key_idx" ON "credit_configs" USING btree ("key");--> statement-breakpoint
CREATE INDEX "credit_levels_level_idx" ON "credit_levels" USING btree ("level");--> statement-breakpoint
CREATE INDEX "credit_levels_min_credits_idx" ON "credit_levels" USING btree ("min_credits");--> statement-breakpoint
CREATE INDEX "credit_redemptions_user_id_redeemed_at_idx" ON "credit_redemptions" USING btree ("user_id","redeemed_at");--> statement-breakpoint
CREATE INDEX "credit_redemptions_status_idx" ON "credit_redemptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credit_redemptions_reward_id_idx" ON "credit_redemptions" USING btree ("reward_id");--> statement-breakpoint
CREATE INDEX "credit_rewards_enabled_sort_order_idx" ON "credit_rewards" USING btree ("enabled","sort_order");--> statement-breakpoint
CREATE INDEX "credit_rewards_category_idx" ON "credit_rewards" USING btree ("category");--> statement-breakpoint
CREATE INDEX "referrals_referrer_id_idx" ON "referrals" USING btree ("referrer_id");--> statement-breakpoint
CREATE INDEX "referrals_referred_id_idx" ON "referrals" USING btree ("referred_id");--> statement-breakpoint
CREATE INDEX "referrals_status_idx" ON "referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "referrals_referrer_status_idx" ON "referrals" USING btree ("referrer_id","status");
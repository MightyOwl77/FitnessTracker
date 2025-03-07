CREATE TABLE "body_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"weight" real NOT NULL,
	"body_fat" real,
	"lean_mass" real,
	"muscle_mass" real,
	"waist_circumference" real,
	"hip_circumference" real,
	"chest_circumference" real,
	"arm_circumference" real,
	"thigh_circumference" real,
	"bench_press_max" real,
	"squat_max" real,
	"deadlift_max" real,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"calories_in" integer NOT NULL,
	"protein_in" integer,
	"fat_in" integer,
	"carbs_in" integer,
	"water_intake" real,
	"fiber_intake" integer,
	"meal_timing" text,
	"is_refeed_day" boolean DEFAULT false,
	"bmr" integer NOT NULL,
	"weight_training_minutes" integer,
	"cardio_minutes" integer,
	"cardio_type" text,
	"step_count" integer,
	"calories_out" integer NOT NULL,
	"deficit" integer NOT NULL,
	"sleep_hours" real,
	"stress_level" integer,
	"energy_level" integer,
	"hunger_level" integer,
	"exercise_intensity" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_weight" real NOT NULL,
	"target_weight" real NOT NULL,
	"current_body_fat" real,
	"target_body_fat" real,
	"time_frame" integer NOT NULL,
	"maintenance_calories" integer,
	"deficit_rate" real,
	"daily_calorie_target" integer NOT NULL,
	"daily_deficit" integer NOT NULL,
	"protein_grams" integer NOT NULL,
	"fat_grams" integer NOT NULL,
	"carb_grams" integer NOT NULL,
	"workout_split" text,
	"weight_lifting_sessions" integer DEFAULT 3,
	"cardio_sessions" integer DEFAULT 2,
	"steps_per_day" integer DEFAULT 10000,
	"weekly_activity_calories" integer,
	"daily_activity_calories" integer,
	"refeed_days" integer DEFAULT 0,
	"diet_break_weeks" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"height" real NOT NULL,
	"weight" real NOT NULL,
	"body_fat_percentage" real,
	"lean_mass" real,
	"fitness_level" text,
	"dietary_preference" text,
	"training_access" text,
	"activity_level" text NOT NULL,
	"health_considerations" text,
	"bmr" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

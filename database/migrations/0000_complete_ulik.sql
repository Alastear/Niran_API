CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	"tel" text,
	"position" text NOT NULL,
	"create_date" timestamp NOT NULL,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" text NOT NULL,
	"brand_description" text,
	"brand_image" text,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_model" (
	"id" serial PRIMARY KEY NOT NULL,
	"model_name" text NOT NULL,
	"brand_name" text NOT NULL,
	"model_submodel" jsonb,
	"model_description" text,
	"model_image" jsonb,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_data_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"cardt_title" text NOT NULL,
	"cardt_type" text NOT NULL,
	"cardt_description" text,
	"update_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "car_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"cars_title" text NOT NULL,
	"brand_name" text NOT NULL,
	"model_name" text NOT NULL,
	"cars_image_default" text,
	"cars_image" jsonb,
	"cars_detail" jsonb NOT NULL,
	"cars_subdetail" jsonb,
	"cars_description" text,
	"cars_status" text NOT NULL,
	"cars_tag" text,
	"update_date" timestamp NOT NULL,
	"create_date" timestamp,
	"booking_date" timestamp,
	"sold_date" timestamp
);

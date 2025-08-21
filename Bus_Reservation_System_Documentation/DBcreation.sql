CREATE TABLE "users" (
  "user_id" uuid PRIMARY KEY,
  "username" varchar,
  "phone_number" varchar(15),
  "email" text,
  "password" text,
  "gender" varchar,
  "role" varchar,
  "last_login" timestamp,
  "is_active" bool,
  "created_at" timestamp
);

CREATE TABLE "booking" (
  "booking_id" uuid PRIMARY KEY,
  "trip_id" uuid,
  "passenger_id" uuid,
  "stop_id" uuid,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "waiting_list" (
  "waiting_id" uuid PRIMARY KEY,
  "booking_id" uuid,
  "trip_id" uuid
);

CREATE TABLE "route" (
  "route_id" uuid PRIMARY KEY,
  "source" text,
  "destination" text,
  "distance" integer,
  "estimated_duration" integer,
  "is_active" bool
);

CREATE TABLE "stop" (
  "stop_id" uuid PRIMARY KEY,
  "stop_name" text,
  "location" text,
  "distance_from_source" integer,
  "is_active" bool
);

CREATE TABLE "payment" (
  "payment_id" uuid PRIMARY KEY,
  "booking_id" uuid,
  "amount" integer,
  "payment_method" varchar,
  "transaction_id" integer,
  "payment_status" varchar,
  "created_at" timestamp,
  "updated_at" timestamp
);

CREATE TABLE "refund" (
  "refund_id" uuid PRIMARY KEY,
  "payment_id" uuid,
  "amount" integer,
  "reason" text,
  "status" varchar,
  "created_at" timestamp,
  "processed_at" timestamp
);

CREATE TABLE "ticket" (
  "ticket_id" uuid PRIMARY KEY,
  "booking_id" uuid,
  "barcode" varchar,
  "status" varchar,
  "created_at" timestamp
);

CREATE TABLE "bus" (
  "bus_id" uuid PRIMARY KEY,
  "plate_number" varchar(8),
  "bus_type" varchar,
  "capacity" integer,
  "is_active" bool,
  "created_at" timestamp
);

CREATE TABLE "seat" (
  "seat_id" uuid PRIMARY KEY,
  "bus_id" uuid,
  "seat_number" varchar(8),
  "seat_type" varchar,
  "status" text,
  "created_at" timestamp
);

CREATE TABLE "routes_stops" (
  "id" uuid PRIMARY KEY,
  "route_id" uuid PRIMARY KEY,
  "stop_id" uuid PRIMARY KEY,
  "position" integer
);


-- Useful index for fast lookups + ordered reads
CREATE INDEX idx_route_stop_route_pos ON route_stop(route_id, position);

CREATE TABLE "trips" (
  "trip_id" uuid PRIMARY KEY,
  "route_id" uuid,
  "date" date,
  "departure_time" time,
  "arrival_time" time
);

CREATE TABLE "trip_bus" (
  "id" uuid PRIMARY KEY,
  "trip_id" uuid,
  "bus_id" uuid
);

ALTER TABLE "booking" ADD FOREIGN KEY ("passenger_id") REFERENCES "users" ("user_id");

ALTER TABLE "booking" ADD FOREIGN KEY ("stop_id") REFERENCES "stop" ("stop_id");

ALTER TABLE "payment" ADD FOREIGN KEY ("booking_id") REFERENCES "booking" ("booking_id");

ALTER TABLE "seat" ADD FOREIGN KEY ("bus_id") REFERENCES "bus" ("bus_id");

ALTER TABLE "ticket" ADD FOREIGN KEY ("booking_id") REFERENCES "booking" ("booking_id");

ALTER TABLE "routes_stops" ADD FOREIGN KEY ("route_id") REFERENCES "route" ("route_id");

ALTER TABLE "routes_stops" ADD FOREIGN KEY ("stop_id") REFERENCES "stop" ("stop_id");

ALTER TABLE "trips" ADD FOREIGN KEY ("route_id") REFERENCES "route" ("route_id");

ALTER TABLE "refund" ADD FOREIGN KEY ("payment_id") REFERENCES "payment" ("payment_id");

ALTER TABLE "trip_bus" ADD FOREIGN KEY ("bus_id") REFERENCES "bus" ("bus_id");

ALTER TABLE "trip_bus" ADD FOREIGN KEY ("trip_id") REFERENCES "trips" ("trip_id");

ALTER TABLE "booking" ADD FOREIGN KEY ("trip_id") REFERENCES "trips" ("trip_id");

-- booking table modifications
ALTER TABLE IF EXISTS public.booking
    ALTER COLUMN trip_id SET NOT NULL;

ALTER TABLE IF EXISTS public.booking
    ALTER COLUMN passenger_id SET NOT NULL;

ALTER TABLE IF EXISTS public.booking
    ALTER COLUMN stop_id SET NOT NULL;

ALTER TABLE IF EXISTS public.booking
    RENAME created_at TO booked_at;

ALTER TABLE IF EXISTS public.booking
    ALTER COLUMN booked_at SET DEFAULT now();

ALTER TABLE IF EXISTS public.booking
    ALTER COLUMN booked_at SET NOT NULL;

ALTER TABLE IF EXISTS public.booking
    ADD COLUMN updated_at timestamp without time zone;

ALTER TABLE IF EXISTS public.booking
    ADD COLUMN payment_id uuid;
ALTER TABLE IF EXISTS public.booking
    ADD CONSTRAINT booking_payment_id_fkey FOREIGN KEY (payment_id)
    REFERENCES public.payment (payment_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE booking
ALTER COLUMN booking_id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.booking DROP COLUMN IF EXISTS priority;

ALTER TABLE IF EXISTS public.booking
    ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE IF EXISTS public.booking
    RENAME payment_id TO seat_id;

ALTER TABLE IF EXISTS public.booking
    ADD COLUMN pirority integer DEFAULT 3;
ALTER TABLE IF EXISTS public.booking DROP CONSTRAINT IF EXISTS booking_payment_id_fkey;

ALTER TABLE IF EXISTS public.booking
    ADD CONSTRAINT booking_seat_id_fkey FOREIGN KEY (seat_id)
    REFERENCES public.seat (seat_id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
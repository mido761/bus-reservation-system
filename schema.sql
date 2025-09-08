--
-- PostgreSQL database dump
--

\restrict e4VjTolT0LhNP6JQabBKftfWH1220MUTlO90rUfc2XzA4hOeES6Su9RmFLJlNk1

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: booking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.booking (
    booking_id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    passenger_id uuid NOT NULL,
    stop_id uuid NOT NULL,
    status character varying,
    booked_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now(),
    seat_id uuid,
    priority integer DEFAULT 3
);


--
-- Name: bus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bus (
    bus_id uuid DEFAULT gen_random_uuid() NOT NULL,
    plate_number character varying(8),
    bus_type character varying,
    capacity integer,
    is_active boolean,
    created_at timestamp without time zone,
    qr_code text,
    check_in_link text
);


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    otp_code text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    last_sent_at timestamp without time zone,
    resend_count integer DEFAULT 0
);


--
-- Name: payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment (
    payment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    amount integer,
    payment_method character varying,
    transaction_id integer,
    payment_status character varying DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: refund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refund (
    refund_id uuid NOT NULL,
    payment_id uuid,
    amount integer,
    reason text,
    status character varying,
    created_at timestamp without time zone,
    processed_at timestamp without time zone
);


--
-- Name: route; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.route (
    route_id uuid DEFAULT gen_random_uuid() NOT NULL,
    source text,
    destination text,
    distance integer,
    estimated_duration integer,
    is_active boolean
);


--
-- Name: route_stop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.route_stop (
    route_id uuid NOT NULL,
    stop_id uuid NOT NULL,
    "position" integer NOT NULL
);


--
-- Name: seat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seat (
    seat_id uuid DEFAULT gen_random_uuid() NOT NULL,
    bus_id uuid,
    seat_number integer,
    seat_type character varying,
    status text,
    created_at timestamp without time zone
);


--
-- Name: stop; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stop (
    stop_id uuid DEFAULT gen_random_uuid() NOT NULL,
    stop_name text,
    location text,
    distance_from_source integer,
    is_active boolean
);


--
-- Name: ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket (
    ticket_id uuid NOT NULL,
    booking_id uuid,
    barcode character varying,
    status character varying,
    created_at timestamp without time zone
);


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    ticket_id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    seat_number character varying(10),
    status character varying(20) DEFAULT 'pending_payment'::character varying NOT NULL,
    issued_at timestamp without time zone,
    email_status character varying(20) DEFAULT 'pending'::character varying,
    email_sent_at timestamp without time zone,
    email_retry_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_ticket_id_seq OWNED BY public.tickets.ticket_id;


--
-- Name: trip_bus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_bus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid,
    bus_id uuid
);


--
-- Name: trips; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trips (
    trip_id uuid DEFAULT gen_random_uuid() NOT NULL,
    route_id uuid,
    date date,
    departure_time time with time zone,
    arrival_time time with time zone,
    price integer DEFAULT 200,
    status character varying DEFAULT 'waiting'::character varying NOT NULL
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying,
    phone_number character varying(15),
    email text,
    password text,
    gender character varying,
    role character varying DEFAULT 'user'::character varying,
    last_login timestamp without time zone,
    is_active boolean,
    created_at timestamp without time zone
);


--
-- Name: waiting_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waiting_list (
    waiting_id uuid NOT NULL,
    booking_id uuid,
    trip_id uuid
);


--
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (booking_id);


--
-- Name: bus bus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bus
    ADD CONSTRAINT bus_pkey PRIMARY KEY (bus_id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);


--
-- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_pkey PRIMARY KEY (refund_id);


--
-- Name: route route_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route
    ADD CONSTRAINT route_pkey PRIMARY KEY (route_id);


--
-- Name: route_stop route_stop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stop
    ADD CONSTRAINT route_stop_pkey PRIMARY KEY (route_id, stop_id);


--
-- Name: seat seat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seat
    ADD CONSTRAINT seat_pkey PRIMARY KEY (seat_id);


--
-- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: stop stop_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stop
    ADD CONSTRAINT stop_pkey PRIMARY KEY (stop_id);


--
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id);


--
-- Name: trip_bus trip_bus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_bus
    ADD CONSTRAINT trip_bus_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (trip_id);


--
-- Name: tickets unique_booking_seat; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT unique_booking_seat UNIQUE (booking_id, seat_number);


--
-- Name: trips unique_trip; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT unique_trip UNIQUE (route_id, date, departure_time);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: waiting_list waiting_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waiting_list
    ADD CONSTRAINT waiting_list_pkey PRIMARY KEY (waiting_id);


--
-- Name: idx_route_stop_route_pos; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_route_stop_route_pos ON public.route_stop USING btree (route_id, "position");


--
-- Name: booking booking_passenger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES public.users(user_id);


--
-- Name: booking booking_seat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_seat_id_fkey FOREIGN KEY (seat_id) REFERENCES public.seat(seat_id) NOT VALID;


--
-- Name: booking booking_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stop(stop_id);


--
-- Name: booking booking_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(trip_id);


--
-- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: payment payment_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id);


--
-- Name: refund refund_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund
    ADD CONSTRAINT refund_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payment(payment_id);


--
-- Name: route_stop route_stop_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stop
    ADD CONSTRAINT route_stop_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(route_id) ON DELETE CASCADE;


--
-- Name: route_stop route_stop_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stop
    ADD CONSTRAINT route_stop_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stop(stop_id) ON DELETE CASCADE;


--
-- Name: seat seat_bus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seat
    ADD CONSTRAINT seat_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.bus(bus_id);


--
-- Name: ticket ticket_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id);


--
-- Name: tickets tickets_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id) ON DELETE CASCADE;


--
-- Name: trip_bus trip_bus_bus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_bus
    ADD CONSTRAINT trip_bus_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.bus(bus_id);


--
-- Name: trip_bus trip_bus_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_bus
    ADD CONSTRAINT trip_bus_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(trip_id);


--
-- Name: trips trips_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(route_id);


--
-- PostgreSQL database dump complete
--

\unrestrict e4VjTolT0LhNP6JQabBKftfWH1220MUTlO90rUfc2XzA4hOeES6Su9RmFLJlNk1


    --
    -- PostgreSQL database dump
    --

    \restrict ECFAgTcV3dg8aTcDxXHYNsG1yaI2Lzv5CgtO6YkeBtWySTJjkgqNIVIvhhouPbb

    -- Dumped from database version 17.6
    -- Dumped by pg_dump version 17.6

    -- Started on 2025-10-12 19:51:45

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
    -- TOC entry 2 (class 3079 OID 16646)
    -- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
    --

    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


    --
    -- TOC entry 5090 (class 0 OID 0)
    -- Dependencies: 2
    -- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
    --

    COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


    SET default_tablespace = '';

    SET default_table_access_method = heap;

    --
    -- TOC entry 218 (class 1259 OID 16683)
    -- Name: booking; Type: TABLE; Schema: public; Owner: postgres
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


    ALTER TABLE public.booking OWNER TO postgres;

    --
    -- TOC entry 219 (class 1259 OID 16692)
    -- Name: bus; Type: TABLE; Schema: public; Owner: postgres
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


    ALTER TABLE public.bus OWNER TO postgres;

    --
    -- TOC entry 234 (class 1259 OID 16897)
    -- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
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


    ALTER TABLE public.password_resets OWNER TO postgres;

    --
    -- TOC entry 220 (class 1259 OID 16698)
    -- Name: payment; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.payment (
        payment_id uuid DEFAULT gen_random_uuid() NOT NULL,
        booking_id uuid NOT NULL,
        amount integer NOT NULL,
        payment_method character varying,
        transaction_id numeric NOT NULL,
        payment_status character varying DEFAULT 'pending'::character varying,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        updated_at timestamp without time zone DEFAULT now(),
        sender_number character varying(11) NOT NULL
    );


    ALTER TABLE public.payment OWNER TO postgres;

    --
    -- TOC entry 221 (class 1259 OID 16707)
    -- Name: refund; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.refund (
        refund_id uuid DEFAULT gen_random_uuid() NOT NULL,
        payment_id uuid NOT NULL,
        amount integer NOT NULL,
        reason text,
        status character varying DEFAULT 'pending'::character varying NOT NULL,
        created_at timestamp without time zone DEFAULT now() NOT NULL,
        processed_at timestamp without time zone DEFAULT now() NOT NULL,
        refund_transaction_id integer,
        transaction_id numeric
    );


    ALTER TABLE public.refund OWNER TO postgres;

    --
    -- TOC entry 222 (class 1259 OID 16712)
    -- Name: route; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.route (
        route_id uuid DEFAULT gen_random_uuid() NOT NULL,
        source text,
        destination text,
        distance integer,
        estimated_duration integer,
        is_active boolean
    );


    ALTER TABLE public.route OWNER TO postgres;

    --
    -- TOC entry 223 (class 1259 OID 16718)
    -- Name: route_stop; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.route_stop (
        route_id uuid NOT NULL,
        stop_id uuid NOT NULL,
        "position" integer NOT NULL
    );


    ALTER TABLE public.route_stop OWNER TO postgres;

    --
    -- TOC entry 224 (class 1259 OID 16721)
    -- Name: seat; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.seat (
        seat_id uuid DEFAULT gen_random_uuid() NOT NULL,
        bus_id uuid,
        seat_number integer,
        seat_type character varying,
        status text,
        created_at timestamp without time zone
    );


    ALTER TABLE public.seat OWNER TO postgres;

    --
    -- TOC entry 225 (class 1259 OID 16727)
    -- Name: stop; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.stop (
        stop_id uuid DEFAULT gen_random_uuid() NOT NULL,
        stop_name text,
        location text,
        distance_from_source integer,
        is_active boolean
    );


    ALTER TABLE public.stop OWNER TO postgres;

    --
    -- TOC entry 226 (class 1259 OID 16733)
    -- Name: ticket; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.ticket (
        ticket_id uuid NOT NULL,
        booking_id uuid,
        barcode character varying,
        status character varying,
        created_at timestamp without time zone
    );


    ALTER TABLE public.ticket OWNER TO postgres;

    --
    -- TOC entry 227 (class 1259 OID 16738)
    -- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
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


    ALTER TABLE public.tickets OWNER TO postgres;

    --
    -- TOC entry 228 (class 1259 OID 16747)
    -- Name: tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
    --

    CREATE SEQUENCE public.tickets_ticket_id_seq
        AS integer
        START WITH 1
        INCREMENT BY 1
        NO MINVALUE
        NO MAXVALUE
        CACHE 1;


    ALTER SEQUENCE public.tickets_ticket_id_seq OWNER TO postgres;

    --
    -- TOC entry 5091 (class 0 OID 0)
    -- Dependencies: 228
    -- Name: tickets_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
    --

    ALTER SEQUENCE public.tickets_ticket_id_seq OWNED BY public.tickets.ticket_id;


    --
    -- TOC entry 229 (class 1259 OID 16748)
    -- Name: trip_bus; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.trip_bus (
        id uuid DEFAULT gen_random_uuid() NOT NULL,
        trip_id uuid,
        bus_id uuid
    );


    ALTER TABLE public.trip_bus OWNER TO postgres;

    --
    -- TOC entry 230 (class 1259 OID 16752)
    -- Name: trips; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.trips (
        trip_id uuid DEFAULT gen_random_uuid() NOT NULL,
        route_id uuid,
        date date,
        departure_time time with time zone,
        arrival_time time with time zone,
        price integer DEFAULT 200,
        status character varying DEFAULT 'waiting'::character varying NOT NULL,
        min_bus_cap integer DEFAULT 15 NOT NULL
    );


    ALTER TABLE public.trips OWNER TO postgres;

    --
    -- TOC entry 231 (class 1259 OID 16760)
    -- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.user_sessions (
        sid character varying NOT NULL,
        sess json NOT NULL,
        expire timestamp(6) without time zone NOT NULL
    );


    ALTER TABLE public.user_sessions OWNER TO postgres;

    --
    -- TOC entry 232 (class 1259 OID 16765)
    -- Name: users; Type: TABLE; Schema: public; Owner: postgres
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


    ALTER TABLE public.users OWNER TO postgres;

    --
    -- TOC entry 233 (class 1259 OID 16772)
    -- Name: waiting_list; Type: TABLE; Schema: public; Owner: postgres
    --

    CREATE TABLE public.waiting_list (
        waiting_id uuid NOT NULL,
        booking_id uuid,
        trip_id uuid
    );


    ALTER TABLE public.waiting_list OWNER TO postgres;

    --
    -- TOC entry 5068 (class 0 OID 16683)
    -- Dependencies: 218
    -- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.booking (booking_id, trip_id, passenger_id, stop_id, status, booked_at, updated_at, seat_id, priority) FROM stdin;
    5169cb99-e207-4adf-a00d-5f8a4cb14eb9	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:26.248163	2025-10-10 18:16:26.248163	\N	3
    5f5f312a-3dfe-46a9-8973-5f2b01183c0e	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:26:54.989714	2025-10-11 11:27:06.740923	\N	\N
    f464c0a5-e7aa-4bb2-b5c7-191ba3859f47	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:26:25.005023	2025-10-11 11:27:06.801629	\N	\N
    fb0ca8b3-50da-4797-9707-46af71572dee	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:26:05.606207	2025-10-11 11:27:09.514583	\N	\N
    a1f61fab-cde6-4de7-8490-545d3496582c	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:27:18.950678	2025-10-11 11:27:46.855556	\N	\N
    bb45a672-666c-444d-b50d-f292385b3abb	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	cancelled	2025-10-11 11:27:28.684144	2025-10-11 11:27:46.893243	\N	\N
    78faad24-f4fb-49a7-ba88-b42199f9c914	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:25:34.947464	2025-10-11 11:27:50.353044	\N	\N
    67637057-445b-4661-b00b-bc0b73fd7592	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:34.222215	2025-10-10 18:16:34.222215	\N	3
    fb76573d-975f-4ae0-9fdf-a4c0fa978952	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:35.810754	2025-10-10 18:16:35.810754	\N	3
    1c632238-a9c6-4893-af84-67b6eed1e890	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:38.723997	2025-10-10 18:16:38.723997	\N	3
    9a6199d5-a3c2-4712-8fbc-34be84b304c7	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:41.263234	2025-10-10 18:16:41.263234	\N	3
    73e6b289-dde7-42d6-8279-f7d646a02ca4	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:43.916993	2025-10-10 18:16:43.916993	\N	3
    3637ecef-47c9-4f8d-952a-d3f60afbb358	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:46.6045	2025-10-10 18:16:46.6045	\N	3
    e37b839a-4272-44ef-86c0-0db1ad19dd66	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:48.985526	2025-10-10 18:16:48.985526	\N	3
    b437cee8-960a-4ab5-9f80-c900f7b357f8	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-10 18:19:35.816465	2025-10-12 11:47:49.844195	\N	\N
    023d8fa4-79ea-4fd6-9728-7b3033f9c67e	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:18:02.677153	2025-10-10 18:18:02.677153	\N	3
    4c6e4058-a58b-4ad9-9330-4447a66e1f0f	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:29:12.253244	2025-10-10 18:29:12.253244	\N	3
    36c49dc8-2fb6-4d4e-84d7-b626cc3a34e1	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:29:25.127763	2025-10-10 18:29:25.127763	\N	3
    e1a3c66f-1446-48e5-b55e-b0250c699433	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:41:18.455221	2025-10-11 11:44:56.183909	\N	\N
    29c41ff9-6ecb-4c57-9cea-b09474877c1e	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	cancelled	2025-10-12 11:56:25.992855	2025-10-12 11:57:01.938608	\N	\N
    e3398c98-5415-4c4d-a67d-dbb9e427184d	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	confirmed	2025-10-12 11:54:57.150294	2025-10-12 11:54:57.150294	\N	3
    ad5a69c8-6c3a-4986-8604-df88fc850b34	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	confirmed	2025-10-12 11:56:05.393876	2025-10-12 11:56:05.393876	\N	3
    4b680054-3b37-42be-a7cb-0766fc2d330e	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:07.784468	2025-10-12 11:56:07.784468	\N	3
    c7aacb78-1757-4338-849c-88b3466bb0a9	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:18.088582	2025-10-12 11:56:18.088582	\N	3
    deb99118-b4cb-4ef3-b359-d4e59033e9c7	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:32.970523	2025-10-12 11:56:32.970523	\N	3
    1502e051-f6ab-4a5a-8bbe-6ba57eab3ed0	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	waiting	2025-10-10 18:16:42.556422	2025-10-12 12:34:16.673914	\N	3
    3ca86874-fa6b-4e27-960c-c61e84ccf5e5	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-10 18:19:48.397904	2025-10-12 11:47:49.782211	\N	\N
    a9ec0556-0ffd-4e27-85bf-97abfc64dd30	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:23.182799	2025-10-10 18:16:23.182799	\N	3
    70f0c9cf-8dfe-4567-89b8-a6943480533e	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:28.536446	2025-10-10 18:16:28.536446	\N	3
    f82f2548-ebcd-4db7-a26a-8136353f17a2	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:30.429096	2025-10-10 18:16:30.429096	\N	3
    f1ac59a3-d190-45e3-b6a9-b424e4ac82a2	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:37.308938	2025-10-10 18:16:37.308938	\N	3
    f5f839b3-7089-43f6-9eb6-f85337d925b7	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:40.013769	2025-10-10 18:16:40.013769	\N	3
    c78fc63f-5727-4c81-88ba-4fdb8286e3c5	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:45.3752	2025-10-10 18:16:45.3752	\N	3
    735a1df3-9c34-4898-9a06-245ebaecfcce	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-10 18:16:47.754015	2025-10-10 18:16:47.754015	\N	3
    c0b7d175-5656-4ca7-b66e-a0fd2919923f	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:17:39.093626	2025-10-10 18:17:39.093626	\N	3
    20241ed3-50c1-4170-8658-ca9de9c60030	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:23:24.237079	2025-10-10 18:23:24.237079	\N	3
    9b9022ea-58b5-403d-b03d-f1b65e4f6f35	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:23:31.775521	2025-10-10 18:23:31.775521	\N	3
    ca1d7bb8-b918-43a6-9081-07d56d37d2d4	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:23:34.297287	2025-10-10 18:23:34.297287	\N	3
    6586d722-3446-446d-be4e-d8f6ac2f4631	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	waiting	2025-10-10 18:23:36.438606	2025-10-10 18:23:36.438606	\N	3
    5d07f883-d582-494b-8676-f337ab6d1c3f	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:55:04.430976	2025-10-12 11:55:04.430976	\N	3
    1618c709-a8f5-4883-af71-55167821b265	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:55:15.211453	2025-10-12 11:55:15.211453	\N	3
    1740fd83-bfa8-4c36-a2c0-ada1def24c57	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:56.393277	2025-10-12 11:56:56.393277	\N	3
    b4a93510-f157-4bbc-940f-3c4f9665006d	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-10 18:22:35.672209	2025-10-12 11:47:54.312084	\N	\N
    0ed9be5a-9106-4f94-b106-04f215628472	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	cancelled	2025-10-11 11:28:12.089934	2025-10-11 11:44:56.242844	\N	\N
    486e5f4e-d1ef-46f9-b5a6-05a74265526c	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:45:29.459136	2025-10-12 11:48:13.632631	\N	\N
    78e0f4d4-9bb4-4278-9875-75ca8a643d90	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:27:56.443157	2025-10-12 11:53:52.060239	\N	\N
    1151f1b4-cfdb-4742-884d-a8b46a827960	6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	cancelled	2025-10-11 11:24:53.059116	2025-10-12 11:54:16.852747	\N	\N
    4273cf5b-0314-44cc-b233-19f82683f21a	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:02.713477	2025-10-12 11:56:02.713477	\N	3
    7065618a-dec3-448e-8804-ff2befb09a83	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	confirmed	2025-10-12 11:56:10.468318	2025-10-12 11:56:10.468318	\N	3
    f1225dd5-62b3-4d38-b80b-e07d7f31e8a6	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:12.993189	2025-10-12 11:56:12.993189	\N	3
    f2060724-ceb6-4e9d-8715-d089db179e30	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	confirmed	2025-10-12 11:56:15.743946	2025-10-12 11:56:15.743946	\N	3
    6d0998e1-db9e-4639-a921-65ed58960648	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	3f46b706-5640-469f-9eee-ed1a6fa68605	confirmed	2025-10-12 11:56:20.755347	2025-10-12 11:56:20.755347	\N	3
    95205374-3970-458d-8b32-e96fe5c8a43d	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:23.161752	2025-10-12 11:56:23.161752	\N	3
    4ec8b8f8-bbdc-4794-9c2e-75573741d00e	d707a08d-eed9-46fa-afca-fba7ff67223b	032b0645-c520-42cd-84c1-a060039f4945	95c9f977-195c-421d-98b3-320188c215cd	confirmed	2025-10-12 11:56:35.864076	2025-10-12 11:56:35.864076	\N	3
    \.


    --
    -- TOC entry 5069 (class 0 OID 16692)
    -- Dependencies: 219
    -- Data for Name: bus; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.bus (bus_id, plate_number, bus_type, capacity, is_active, created_at, qr_code, check_in_link) FROM stdin;
    \.


    --
    -- TOC entry 5084 (class 0 OID 16897)
    -- Dependencies: 234
    -- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.password_resets (id, user_id, otp_code, expires_at, created_at, last_sent_at, resend_count) FROM stdin;
    \.


    --
    -- TOC entry 5070 (class 0 OID 16698)
    -- Dependencies: 220
    -- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.payment (payment_id, booking_id, amount, payment_method, transaction_id, payment_status, created_at, updated_at, sender_number) FROM stdin;
    \.


    --
    -- TOC entry 5071 (class 0 OID 16707)
    -- Dependencies: 221
    -- Data for Name: refund; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.refund (refund_id, payment_id, amount, reason, status, created_at, processed_at, refund_transaction_id, transaction_id) FROM stdin;
    \.


    --
    -- TOC entry 5072 (class 0 OID 16712)
    -- Dependencies: 222
    -- Data for Name: route; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.route (route_id, source, destination, distance, estimated_duration, is_active) FROM stdin;
    7223cbe7-f4e6-4ab0-b940-f792f58c820d	Cairo	EJUST	279	3	t
    \.


    --
    -- TOC entry 5073 (class 0 OID 16718)
    -- Dependencies: 223
    -- Data for Name: route_stop; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.route_stop (route_id, stop_id, "position") FROM stdin;
    7223cbe7-f4e6-4ab0-b940-f792f58c820d	95c9f977-195c-421d-98b3-320188c215cd	1
    7223cbe7-f4e6-4ab0-b940-f792f58c820d	3f46b706-5640-469f-9eee-ed1a6fa68605	2
    \.


    --
    -- TOC entry 5074 (class 0 OID 16721)
    -- Dependencies: 224
    -- Data for Name: seat; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.seat (seat_id, bus_id, seat_number, seat_type, status, created_at) FROM stdin;
    \.


    --
    -- TOC entry 5075 (class 0 OID 16727)
    -- Dependencies: 225
    -- Data for Name: stop; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.stop (stop_id, stop_name, location, distance_from_source, is_active) FROM stdin;
    0e370454-f0ea-41c6-a677-81aef338f06a	 	tarek	\N	\N
    95c9f977-195c-421d-98b3-320188c215cd	ramese	tarek	\N	\N
    3f46b706-5640-469f-9eee-ed1a6fa68605	dandy	tarek	\N	\N
    \.


    --
    -- TOC entry 5076 (class 0 OID 16733)
    -- Dependencies: 226
    -- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.ticket (ticket_id, booking_id, barcode, status, created_at) FROM stdin;
    \.


    --
    -- TOC entry 5077 (class 0 OID 16738)
    -- Dependencies: 227
    -- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.tickets (ticket_id, booking_id, seat_number, status, issued_at, email_status, email_sent_at, email_retry_count, created_at, updated_at) FROM stdin;
    1bff4999-ef3f-4aac-a4f1-02a3ab0eb65c	5f5f312a-3dfe-46a9-8973-5f2b01183c0e	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:26:54.989714	2025-10-11 11:26:54.989714
    8687452c-8604-4bd7-ac31-d545b02abf15	78e0f4d4-9bb4-4278-9875-75ca8a643d90	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:27:56.443157	2025-10-11 11:27:56.443157
    f7e37de4-2492-4768-a416-c91022c1cf4a	e3398c98-5415-4c4d-a67d-dbb9e427184d	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:54:57.150294	2025-10-12 11:54:57.150294
    b570f05d-8bad-4a5c-bf5d-7e5da3420acb	5d07f883-d582-494b-8676-f337ab6d1c3f	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:55:04.430976	2025-10-12 11:55:04.430976
    97aec8bd-c1bd-4b4f-9a21-71c2f3160781	1618c709-a8f5-4883-af71-55167821b265	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:55:15.211453	2025-10-12 11:55:15.211453
    d77a28b0-aeba-42bc-ad1e-d86bdda7e5c7	1740fd83-bfa8-4c36-a2c0-ada1def24c57	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:56.393277	2025-10-12 11:56:56.393277
    e1c04503-9861-4f32-bcf9-2beef1a22d22	a9ec0556-0ffd-4e27-85bf-97abfc64dd30	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:23.182799	2025-10-10 18:16:23.182799
    178e686c-1520-412f-a9a3-2c58ad951ea2	5169cb99-e207-4adf-a00d-5f8a4cb14eb9	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:26.248163	2025-10-10 18:16:26.248163
    a10a7cb0-7dd3-4dbc-8f27-3aca83ac02ad	70f0c9cf-8dfe-4567-89b8-a6943480533e	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:28.536446	2025-10-10 18:16:28.536446
    a7aeb906-d008-466f-a088-7f6a99d6e3b2	f82f2548-ebcd-4db7-a26a-8136353f17a2	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:30.429096	2025-10-10 18:16:30.429096
    4f1d23ad-986d-4cca-a42f-be96a5a5ae9c	67637057-445b-4661-b00b-bc0b73fd7592	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:34.222215	2025-10-10 18:16:34.222215
    030a243d-8cf1-4634-b094-aa2524d029fe	fb76573d-975f-4ae0-9fdf-a4c0fa978952	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:35.810754	2025-10-10 18:16:35.810754
    bc093698-4f07-48a6-ba28-9b6fbf76630d	f1ac59a3-d190-45e3-b6a9-b424e4ac82a2	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:37.308938	2025-10-10 18:16:37.308938
    06a1822d-478f-4bab-9a0f-31cc9821e35c	1c632238-a9c6-4893-af84-67b6eed1e890	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:38.723997	2025-10-10 18:16:38.723997
    fb14f869-06b8-4796-aed9-759e79a265de	f5f839b3-7089-43f6-9eb6-f85337d925b7	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:40.013769	2025-10-10 18:16:40.013769
    503fba79-c4b3-4f94-87a9-001c41bba0a9	9a6199d5-a3c2-4712-8fbc-34be84b304c7	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:41.263234	2025-10-10 18:16:41.263234
    e76f89da-8ac9-42ba-8ac6-2d70356282e0	1502e051-f6ab-4a5a-8bbe-6ba57eab3ed0	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:42.556422	2025-10-10 18:16:42.556422
    fc6f03ef-9765-439f-87db-7e38eefb7b74	73e6b289-dde7-42d6-8279-f7d646a02ca4	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:43.916993	2025-10-10 18:16:43.916993
    03814744-55bb-4a50-87bd-07dc92701714	c78fc63f-5727-4c81-88ba-4fdb8286e3c5	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:45.3752	2025-10-10 18:16:45.3752
    43df6551-f7a9-47d3-8a83-9b3b5a269002	3637ecef-47c9-4f8d-952a-d3f60afbb358	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:46.6045	2025-10-10 18:16:46.6045
    68b7cd4a-04ce-49ef-9182-2402a63d8364	735a1df3-9c34-4898-9a06-245ebaecfcce	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:47.754015	2025-10-10 18:16:47.754015
    9f0db21a-28f3-4b76-b7cc-d544e01715d1	a1f61fab-cde6-4de7-8490-545d3496582c	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:27:18.950678	2025-10-11 11:27:18.950678
    6379a768-521e-4116-b509-b8d4fe4f2909	0ed9be5a-9106-4f94-b106-04f215628472	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:28:12.089934	2025-10-11 11:28:12.089934
    1d2ad03b-3d19-440b-bf29-996b879a8a88	e1a3c66f-1446-48e5-b55e-b0250c699433	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:41:18.455221	2025-10-11 11:41:18.455221
    a4b92080-8f3f-4d21-a59d-c5e4a28b838b	4273cf5b-0314-44cc-b233-19f82683f21a	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:02.713477	2025-10-12 11:56:02.713477
    ec2549ac-cfb7-4a5b-9fbc-2815a7707af4	7065618a-dec3-448e-8804-ff2befb09a83	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:10.468318	2025-10-12 11:56:10.468318
    6c27963b-1979-49d2-9d20-fe18dce9b4ba	f1225dd5-62b3-4d38-b80b-e07d7f31e8a6	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:12.993189	2025-10-12 11:56:12.993189
    3191c5ac-d3f9-4b43-bdd4-d648d410a142	f2060724-ceb6-4e9d-8715-d089db179e30	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:15.743946	2025-10-12 11:56:15.743946
    18aa49bc-2690-4526-b287-698c5e0bb1ee	6d0998e1-db9e-4639-a921-65ed58960648	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:20.755347	2025-10-12 11:56:20.755347
    b648570d-1dc5-4ac2-9e23-df5c53937a3a	95205374-3970-458d-8b32-e96fe5c8a43d	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:23.161752	2025-10-12 11:56:23.161752
    fb64b03e-1a8a-4309-9980-bba6063f2045	4ec8b8f8-bbdc-4794-9c2e-75573741d00e	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:35.864076	2025-10-12 11:56:35.864076
    d5129016-23ea-411b-afeb-930cedbdb9d0	e37b839a-4272-44ef-86c0-0db1ad19dd66	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:16:48.985526	2025-10-10 18:16:48.985526
    7da0db97-da1e-459f-8b0d-eccb1afb8489	c0b7d175-5656-4ca7-b66e-a0fd2919923f	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:17:39.093626	2025-10-10 18:17:39.093626
    4a62e31b-c2f5-4012-b731-0fa997d11843	023d8fa4-79ea-4fd6-9728-7b3033f9c67e	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:18:02.677153	2025-10-10 18:18:02.677153
    45bd3d59-0002-4186-8366-9e5cca6cc003	b437cee8-960a-4ab5-9f80-c900f7b357f8	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:19:35.816465	2025-10-10 18:19:35.816465
    bfe9208b-e172-4870-9200-bc633d05714a	3ca86874-fa6b-4e27-960c-c61e84ccf5e5	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:19:48.397904	2025-10-10 18:19:48.397904
    69e9c95c-0a4d-430c-b84a-b2792ef9503b	b4a93510-f157-4bbc-940f-3c4f9665006d	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:22:35.672209	2025-10-10 18:22:35.672209
    00189c0c-0f32-44b1-8642-821175bd30c9	20241ed3-50c1-4170-8658-ca9de9c60030	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:23:24.237079	2025-10-10 18:23:24.237079
    bf4f445f-57a3-4278-9ce4-309227b8beda	9b9022ea-58b5-403d-b03d-f1b65e4f6f35	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:23:31.775521	2025-10-10 18:23:31.775521
    0fa39a0e-1997-4c81-b5a5-e8308a756932	ca1d7bb8-b918-43a6-9081-07d56d37d2d4	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:23:34.297287	2025-10-10 18:23:34.297287
    0bb63603-aed8-4235-a6aa-5b0f45c4d4dc	6586d722-3446-446d-be4e-d8f6ac2f4631	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:23:36.438606	2025-10-10 18:23:36.438606
    1854f087-f866-472e-aa3b-12cde4cc383c	4c6e4058-a58b-4ad9-9330-4447a66e1f0f	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:29:12.253244	2025-10-10 18:29:12.253244
    e0b67f0e-b424-4cc1-8f2f-e149930551a9	36c49dc8-2fb6-4d4e-84d7-b626cc3a34e1	\N	pending_payment	\N	pending	\N	0	2025-10-10 18:29:25.127763	2025-10-10 18:29:25.127763
    1337ddd3-5137-49f6-9073-0718e3241a7b	1151f1b4-cfdb-4742-884d-a8b46a827960	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:24:53.059116	2025-10-11 11:24:53.059116
    44e2f563-d1f6-45c1-8538-2454d5884324	78faad24-f4fb-49a7-ba88-b42199f9c914	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:25:34.947464	2025-10-11 11:25:34.947464
    381bb859-8366-4184-aace-f236c4d06778	fb0ca8b3-50da-4797-9707-46af71572dee	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:26:05.606207	2025-10-11 11:26:05.606207
    fcee1e76-2587-4e08-a21b-6d659a1e6d35	f464c0a5-e7aa-4bb2-b5c7-191ba3859f47	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:26:25.005023	2025-10-11 11:26:25.005023
    0f847e83-d4b3-427a-8b63-37bdcdce3174	bb45a672-666c-444d-b50d-f292385b3abb	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:27:28.684144	2025-10-11 11:27:28.684144
    28e78d80-11d6-4a3f-9b6a-a533ad2c33a9	486e5f4e-d1ef-46f9-b5a6-05a74265526c	\N	pending_payment	\N	pending	\N	0	2025-10-11 11:45:29.459136	2025-10-11 11:45:29.459136
    bb6db13d-dbf2-4ceb-b5d2-aacbded94b53	ad5a69c8-6c3a-4986-8604-df88fc850b34	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:05.393876	2025-10-12 11:56:05.393876
    c8c493c6-453a-46aa-8297-da9681f6c965	4b680054-3b37-42be-a7cb-0766fc2d330e	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:07.784468	2025-10-12 11:56:07.784468
    46f775dc-9881-4f3a-aebd-4de6b0f44014	c7aacb78-1757-4338-849c-88b3466bb0a9	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:18.088582	2025-10-12 11:56:18.088582
    8dfb3dcf-4dfb-42f4-ab17-9cdce6e6997c	29c41ff9-6ecb-4c57-9cea-b09474877c1e	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:25.992855	2025-10-12 11:56:25.992855
    29a683dc-4310-4575-908c-4da836d6b527	deb99118-b4cb-4ef3-b359-d4e59033e9c7	\N	pending_payment	\N	pending	\N	0	2025-10-12 11:56:32.970523	2025-10-12 11:56:32.970523
    \.


    --
    -- TOC entry 5079 (class 0 OID 16748)
    -- Dependencies: 229
    -- Data for Name: trip_bus; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.trip_bus (id, trip_id, bus_id) FROM stdin;
    \.


    --
    -- TOC entry 5080 (class 0 OID 16752)
    -- Dependencies: 230
    -- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.trips (trip_id, route_id, date, departure_time, arrival_time, price, status, min_bus_cap) FROM stdin;
    cb7d2fe9-ee5e-46c9-aa45-3177f0fcfe05	7223cbe7-f4e6-4ab0-b940-f792f58c820d	2025-09-07	16:00:00+03	21:22:00+03	200	waiting	15
    d707a08d-eed9-46fa-afca-fba7ff67223b	7223cbe7-f4e6-4ab0-b940-f792f58c820d	2025-09-08	22:22:00+03	21:24:00+03	200	waiting	15
    6f6635c2-df52-4f3a-8ae0-d99ae9d5c349	7223cbe7-f4e6-4ab0-b940-f792f58c820d	2025-10-04	17:42:00+03	15:44:00+03	200	waiting	15
    \.


    --
    -- TOC entry 5081 (class 0 OID 16760)
    -- Dependencies: 231
    -- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.user_sessions (sid, sess, expire) FROM stdin;
    Dl8__3kwsw5PevD4wCHoLSCrsYUlUwEl	{"cookie":{"originalMaxAge":86400000,"expires":"2025-10-13T08:45:22.078Z","secure":false,"httpOnly":true,"path":"/","sameSite":"strict"},"userId":"032b0645-c520-42cd-84c1-a060039f4945","userRole":"admin"}	2025-10-13 15:11:34
    \.


    --
    -- TOC entry 5082 (class 0 OID 16765)
    -- Dependencies: 232
    -- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.users (user_id, username, phone_number, email, password, gender, role, last_login, is_active, created_at) FROM stdin;
    032b0645-c520-42cd-84c1-a060039f4945	Mohamed Ahmed	01012416300	modystar9999@gmail.com	$2b$10$yeauLVLhTnIknkTQKmDume7.c3LqQsfOv2fsjDEkYAWVFuQxNYwD2	Male	admin	\N	\N	\N
    \.


    --
    -- TOC entry 5083 (class 0 OID 16772)
    -- Dependencies: 233
    -- Data for Name: waiting_list; Type: TABLE DATA; Schema: public; Owner: postgres
    --

    COPY public.waiting_list (waiting_id, booking_id, trip_id) FROM stdin;
    \.


    --
    -- TOC entry 5092 (class 0 OID 0)
    -- Dependencies: 228
    -- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
    --

    SELECT pg_catalog.setval('public.tickets_ticket_id_seq', 1, false);


    --
    -- TOC entry 4872 (class 2606 OID 16776)
    -- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.booking
        ADD CONSTRAINT booking_pkey PRIMARY KEY (booking_id);


    --
    -- TOC entry 4874 (class 2606 OID 16778)
    -- Name: bus bus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.bus
        ADD CONSTRAINT bus_pkey PRIMARY KEY (bus_id);


    --
    -- TOC entry 4907 (class 2606 OID 16906)
    -- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.password_resets
        ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


    --
    -- TOC entry 4876 (class 2606 OID 16780)
    -- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.payment
        ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);


    --
    -- TOC entry 4878 (class 2606 OID 16782)
    -- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.refund
        ADD CONSTRAINT refund_pkey PRIMARY KEY (refund_id);


    --
    -- TOC entry 4880 (class 2606 OID 16784)
    -- Name: route route_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.route
        ADD CONSTRAINT route_pkey PRIMARY KEY (route_id);


    --
    -- TOC entry 4883 (class 2606 OID 16786)
    -- Name: route_stop route_stop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.route_stop
        ADD CONSTRAINT route_stop_pkey PRIMARY KEY (route_id, stop_id);


    --
    -- TOC entry 4885 (class 2606 OID 16788)
    -- Name: seat seat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.seat
        ADD CONSTRAINT seat_pkey PRIMARY KEY (seat_id);


    --
    -- TOC entry 4901 (class 2606 OID 16790)
    -- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.user_sessions
        ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


    --
    -- TOC entry 4887 (class 2606 OID 16792)
    -- Name: stop stop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.stop
        ADD CONSTRAINT stop_pkey PRIMARY KEY (stop_id);


    --
    -- TOC entry 4889 (class 2606 OID 16794)
    -- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.ticket
        ADD CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id);


    --
    -- TOC entry 4891 (class 2606 OID 16796)
    -- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.tickets
        ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id);


    --
    -- TOC entry 4895 (class 2606 OID 16798)
    -- Name: trip_bus trip_bus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.trip_bus
        ADD CONSTRAINT trip_bus_pkey PRIMARY KEY (id);


    --
    -- TOC entry 4897 (class 2606 OID 16800)
    -- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.trips
        ADD CONSTRAINT trips_pkey PRIMARY KEY (trip_id);


    --
    -- TOC entry 4893 (class 2606 OID 16802)
    -- Name: tickets unique_booking_seat; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.tickets
        ADD CONSTRAINT unique_booking_seat UNIQUE (booking_id, seat_number);


    --
    -- TOC entry 4899 (class 2606 OID 16804)
    -- Name: trips unique_trip; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.trips
        ADD CONSTRAINT unique_trip UNIQUE (route_id, date, departure_time);


    --
    -- TOC entry 4903 (class 2606 OID 16806)
    -- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.users
        ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


    --
    -- TOC entry 4905 (class 2606 OID 16808)
    -- Name: waiting_list waiting_list_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.waiting_list
        ADD CONSTRAINT waiting_list_pkey PRIMARY KEY (waiting_id);


    --
    -- TOC entry 4881 (class 1259 OID 16809)
    -- Name: idx_route_stop_route_pos; Type: INDEX; Schema: public; Owner: postgres
    --

    CREATE INDEX idx_route_stop_route_pos ON public.route_stop USING btree (route_id, "position");


    --
    -- TOC entry 4908 (class 2606 OID 16810)
    -- Name: booking booking_passenger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.booking
        ADD CONSTRAINT booking_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES public.users(user_id);


    --
    -- TOC entry 4909 (class 2606 OID 16815)
    -- Name: booking booking_seat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.booking
        ADD CONSTRAINT booking_seat_id_fkey FOREIGN KEY (seat_id) REFERENCES public.seat(seat_id) NOT VALID;


    --
    -- TOC entry 4910 (class 2606 OID 16820)
    -- Name: booking booking_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.booking
        ADD CONSTRAINT booking_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stop(stop_id);


    --
    -- TOC entry 4911 (class 2606 OID 16825)
    -- Name: booking booking_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.booking
        ADD CONSTRAINT booking_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(trip_id);


    --
    -- TOC entry 4922 (class 2606 OID 16907)
    -- Name: password_resets password_resets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.password_resets
        ADD CONSTRAINT password_resets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


    --
    -- TOC entry 4912 (class 2606 OID 16830)
    -- Name: payment payment_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.payment
        ADD CONSTRAINT payment_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id);


    --
    -- TOC entry 4913 (class 2606 OID 16835)
    -- Name: refund refund_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.refund
        ADD CONSTRAINT refund_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payment(payment_id);


    --
    -- TOC entry 4914 (class 2606 OID 16840)
    -- Name: route_stop route_stop_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.route_stop
        ADD CONSTRAINT route_stop_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(route_id) ON DELETE CASCADE;


    --
    -- TOC entry 4915 (class 2606 OID 16845)
    -- Name: route_stop route_stop_stop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.route_stop
        ADD CONSTRAINT route_stop_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stop(stop_id) ON DELETE CASCADE;


    --
    -- TOC entry 4916 (class 2606 OID 16850)
    -- Name: seat seat_bus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.seat
        ADD CONSTRAINT seat_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.bus(bus_id);


    --
    -- TOC entry 4917 (class 2606 OID 16855)
    -- Name: ticket ticket_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.ticket
        ADD CONSTRAINT ticket_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id);


    --
    -- TOC entry 4918 (class 2606 OID 16860)
    -- Name: tickets tickets_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.tickets
        ADD CONSTRAINT tickets_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.booking(booking_id) ON DELETE CASCADE;


    --
    -- TOC entry 4919 (class 2606 OID 16865)
    -- Name: trip_bus trip_bus_bus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.trip_bus
        ADD CONSTRAINT trip_bus_bus_id_fkey FOREIGN KEY (bus_id) REFERENCES public.bus(bus_id);


    --
    -- TOC entry 4920 (class 2606 OID 16870)
    -- Name: trip_bus trip_bus_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.trip_bus
        ADD CONSTRAINT trip_bus_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(trip_id);


    --
    -- TOC entry 4921 (class 2606 OID 16875)
    -- Name: trips trips_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
    --

    ALTER TABLE ONLY public.trips
        ADD CONSTRAINT trips_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(route_id);


    -- Completed on 2025-10-12 19:51:45

    --
    -- PostgreSQL database dump complete
    --

    \unrestrict ECFAgTcV3dg8aTcDxXHYNsG1yaI2Lzv5CgtO6YkeBtWySTJjkgqNIVIvhhouPbb


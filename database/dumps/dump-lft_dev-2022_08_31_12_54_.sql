--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2 (Debian 13.2-1.pgdg100+1)
-- Dumped by pg_dump version 13.2 (Debian 13.2-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: game_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_config (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying NOT NULL,
    name character varying(200) NOT NULL,
    description character varying(500),
    logo character varying(500) NOT NULL,
    href character varying,
    "isActive" boolean DEFAULT false NOT NULL
);


--
-- Name: league_room; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_room (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    description character varying(1500),
    region character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    demanded_positions character varying[] NOT NULL
);


--
-- Name: league_room_application; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_room_application (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    status integer NOT NULL,
    "appliedForPosition" character varying NOT NULL,
    "isOwner" boolean DEFAULT false NOT NULL,
    "leagueUserId" uuid NOT NULL,
    "roomId" uuid NOT NULL
);


--
-- Name: league_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_user (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    "summonerId" character varying(255) NOT NULL,
    region character varying NOT NULL,
    "mainPosition" character varying NOT NULL,
    "secondaryPosition" character varying NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    type character varying(255) NOT NULL,
    handlers character varying[] NOT NULL,
    status character varying(255) NOT NULL,
    retries smallint DEFAULT '0'::smallint NOT NULL,
    data json DEFAULT '{}'::json NOT NULL,
    "userId" uuid NOT NULL
);


--
-- Name: room_chat_message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_chat_message (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    message character varying(5000) NOT NULL,
    room_id uuid NOT NULL,
    "authorId" uuid
);


--
-- Name: seeding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seeding (
    id character varying NOT NULL,
    "creationDate" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    message character varying(5000) NOT NULL,
    type smallint NOT NULL,
    author_name character varying(100),
    author_email character varying(100)
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    username character varying(500) NOT NULL,
    password character varying(500) NOT NULL,
    email character varying(100) NOT NULL,
    role integer DEFAULT 1 NOT NULL,
    reset_password_verification_code character varying(7),
    reset_password_verification_code_sent_at timestamp without time zone,
    reset_password_verification_code_verified_at timestamp without time zone,
    "gamesId" uuid
);


--
-- Name: user_games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_games (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    "deletedAt" timestamp without time zone,
    league_of_legends uuid
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: game_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_config (id, key, name, description, logo, href, "isActive") FROM stdin;
\.


--
-- Data for Name: league_room; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_room (id, "createdAt", "updatedAt", "deletedAt", description, region, date, demanded_positions) FROM stdin;
\.


--
-- Data for Name: league_room_application; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_room_application (id, "createdAt", "updatedAt", "deletedAt", status, "appliedForPosition", "isOwner", "leagueUserId", "roomId") FROM stdin;
\.


--
-- Data for Name: league_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_user (id, "createdAt", "updatedAt", "deletedAt", "summonerId", region, "mainPosition", "secondaryPosition") FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification (id, "createdAt", "updatedAt", "deletedAt", type, handlers, status, retries, data, "userId") FROM stdin;
\.


--
-- Data for Name: room_chat_message; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.room_chat_message (id, "createdAt", "updatedAt", "deletedAt", message, room_id, "authorId") FROM stdin;
\.


--
-- Data for Name: seeding; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seeding (id, "creationDate") FROM stdin;
\.


--
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket (id, "createdAt", "updatedAt", "deletedAt", message, type, author_name, author_email) FROM stdin;
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, "createdAt", "updatedAt", "deletedAt", username, password, email, role, reset_password_verification_code, reset_password_verification_code_sent_at, reset_password_verification_code_verified_at, "gamesId") FROM stdin;
\.


--
-- Data for Name: user_games; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_games (id, "createdAt", "updatedAt", "deletedAt", league_of_legends) FROM stdin;
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: league_room PK_004aed4e743b926af7dc14a34d3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_room
    ADD CONSTRAINT "PK_004aed4e743b926af7dc14a34d3" PRIMARY KEY (id);


--
-- Name: league_user PK_12289821a4080fad99b3870a165; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_user
    ADD CONSTRAINT "PK_12289821a4080fad99b3870a165" PRIMARY KEY (id);


--
-- Name: league_room_application PK_3c0d9c048e63880d9ec77a47ab9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_room_application
    ADD CONSTRAINT "PK_3c0d9c048e63880d9ec77a47ab9" PRIMARY KEY (id);


--
-- Name: seeding PK_4e3a08e6e2f056dea74303da4ca; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seeding
    ADD CONSTRAINT "PK_4e3a08e6e2f056dea74303da4ca" PRIMARY KEY (id);


--
-- Name: game_config PK_6572e2a84c4c5d72a9227e0b894; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_config
    ADD CONSTRAINT "PK_6572e2a84c4c5d72a9227e0b894" PRIMARY KEY (id);


--
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: room_chat_message PK_a7f9ec8bdb2eef963aa22290a55; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_chat_message
    ADD CONSTRAINT "PK_a7f9ec8bdb2eef963aa22290a55" PRIMARY KEY (id);


--
-- Name: user_games PK_c9cc6a3afdc17ef440abea3b055; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "PK_c9cc6a3afdc17ef440abea3b055" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: ticket PK_d9a0835407701eb86f874474b7c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY (id);


--
-- Name: user REL_37166bf4410012c8cd156f5197; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "REL_37166bf4410012c8cd156f5197" UNIQUE ("gamesId");


--
-- Name: user_games REL_8fbc5c0b9919195f3067d4b130; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "REL_8fbc5c0b9919195f3067d4b130" UNIQUE (league_of_legends);


--
-- Name: user UQ_78a916df40e02a9deb1c4b75edb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE (username);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: chat_message_room_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chat_message_room_id ON public.room_chat_message USING btree (room_id);


--
-- Name: idx_league_room_application_room; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_league_room_application_room ON public.league_room_application USING btree ("roomId");


--
-- Name: idx_league_room_application_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_league_room_application_user ON public.league_room_application USING btree ("leagueUserId");


--
-- Name: idx_league_room_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_league_room_date ON public.league_room USING btree (date);


--
-- Name: notification FK_1ced25315eb974b73391fb1c81b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user FK_37166bf4410012c8cd156f5197f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_37166bf4410012c8cd156f5197f" FOREIGN KEY ("gamesId") REFERENCES public.user_games(id);


--
-- Name: user_games FK_8fbc5c0b9919195f3067d4b1305; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "FK_8fbc5c0b9919195f3067d4b1305" FOREIGN KEY (league_of_legends) REFERENCES public.league_user(id) ON DELETE SET NULL;


--
-- Name: league_room_application FK_d28e76e330cc23d67c91d1dbe8f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_room_application
    ADD CONSTRAINT "FK_d28e76e330cc23d67c91d1dbe8f" FOREIGN KEY ("leagueUserId") REFERENCES public.league_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: room_chat_message FK_dba01fd7c2a487e6691227c06d4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_chat_message
    ADD CONSTRAINT "FK_dba01fd7c2a487e6691227c06d4" FOREIGN KEY ("authorId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: league_room_application FK_e965e09191e9c862fe9bbef3d24; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_room_application
    ADD CONSTRAINT "FK_e965e09191e9c862fe9bbef3d24" FOREIGN KEY ("roomId") REFERENCES public.league_room(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


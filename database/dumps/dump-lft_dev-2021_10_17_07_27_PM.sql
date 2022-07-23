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
    "isActive" boolean DEFAULT false NOT NULL
);


--
-- Name: league_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.league_user (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now()
);


--
-- Name: seeding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seeding (
    id character varying NOT NULL,
    "creationDate" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    username character varying(500) NOT NULL,
    password character varying(500) NOT NULL,
    email character varying(100) NOT NULL,
    role integer DEFAULT 1 NOT NULL,
    "gamesId" uuid
);


--
-- Name: user_games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_games (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now(),
    league_of_legends uuid
);


--
-- Data for Name: game_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.game_config (id, key, name, description, logo, "isActive") FROM stdin;
bb506b8b-abf4-4460-8498-d8015baeb19d	league_of_legends	League of Legends	Riot Games	https://i.imgur.com/vgERB5I.png	t
\.


--
-- Data for Name: league_user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.league_user (id, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: seeding; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seeding (id, "creationDate") FROM stdin;
users-seeding	2021-10-15 15:00:03.191421
config-seeding	2021-10-15 15:00:04.191124
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."user" (id, "createdAt", "updatedAt", username, password, email, role, "gamesId") FROM stdin;
871652eb-9768-440a-b997-8e93c0dfa6f3	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	admin	$2b$10$7BW3a1.e2mHV4qi6gMS7i.GLfxOqaOmVPt2d1UxdekHxCTt/WRSC2	admin@gmail.com	2	1cbbc1e0-fde6-458f-a59e-5dd3f99a3784
92a368cb-1910-4cd9-bab8-95d19ed7f3f8	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Jailyn.Dibbert	$2b$10$aODBxLXMgA2B9RvdYKCjJeyayyllxdjjaQUn9kb010r95r.GeKGfu	Agustina.Howe@yahoo.com	1	77e1360d-59b9-4407-aa2f-39d912af03db
5bff8f21-f67d-4552-b0b3-ade23b6f67ad	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Ross_Wiegand0	$2b$10$0h7bdeBuv1ynbC.a5tPgIeikLY0b1LdZS4sNiIrJiMLYm0iYlUrke	Eliseo_Jacobson@hotmail.com	1	7ef93a7d-0d16-4bff-abbb-a5e8f3d28864
35b97fe6-ce65-42bc-9574-5a9d20b04e8d	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Aisha57	$2b$10$ijbRNephnrfSp4BUxV1Mpe3nM.uUw48cHE5SqOOo.rzSQUjTFlK3K	Mollie.Boyle@gmail.com	1	b676168f-ebf4-46b9-bad0-5466555b0f11
2d6dff17-517f-4abb-984e-781b39f64512	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Herbert13	$2b$10$sO/6x3Syp2p8Uw0B1T9LUeXkhiTqL1GCHPPYrT3XuGNWyW2L/zGty	Unique.Bernier@yahoo.com	1	d4e62c99-de1c-45b9-a1d0-06b253e820d5
6541198a-8018-4aa6-8f5d-f0eea0b991f5	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Eliane_Legros69	$2b$10$czQWiq2vXULH4Kl3CdcjpOX8E1e1Ou9b49FfcGXmJ6QwjLHpTPpLq	Kyle.Abernathy@hotmail.com	1	d72cfc50-be98-4d57-9708-26fba795a270
f38edffc-29e1-4973-85cf-4d34156c6412	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Jarrett_Dickinson33	$2b$10$C6.XtTVuIFCrTBLh9GDO.eKSJ6rxNcRGhy5rP3fYJPyV9S191l.ri	Tito_Wilderman88@gmail.com	1	f09649b2-4beb-435f-aa73-40a985a53b97
4cea31dd-fa3a-4716-95ee-2e0cecd3266e	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Lincoln.Windler	$2b$10$Cy4CQFGICyRDO69g2B/UBe1sO4O6HnzAtEeS5.wFH4WTH6zfvkWti	Jammie.Heidenreich@hotmail.com	1	72ca8f1c-8967-4667-be84-02011704a2c7
fe9ad0f2-cc3a-4742-8797-b39b7e07bed0	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Presley67	$2b$10$xnZ6gYGMrU5VSzX0H298FezctlRWlgapME.jD84b.u8hT49howJCq	Perry.Turner27@hotmail.com	1	bbcdd410-1d3e-412f-9edb-b8dca223b5df
298bc83c-b585-4477-8893-d0cac4d2505d	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Owen96	$2b$10$KIYw7uZKJ8qnFJlPcPlZ9eG8SeblYwQ8z4oxF0r2kbGZEbzFo3RdK	Julien34@gmail.com	1	05cdb0c1-6652-4656-aed8-89211cea81c3
b6cc8929-515c-478e-8215-a913ead08559	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Sheridan.Schroeder	$2b$10$Q/6rg/4Q.w6er94DB8tfJOuYvqoBHOo1H3mULpIAA2WzkI1g5uicm	Rebecca_Weimann@hotmail.com	1	003918db-e31b-4aab-9648-9e00577af32a
31a938d0-504c-442e-a6d2-5d42bcab0f7d	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Lyda19	$2b$10$KJLnSHmVVn69CR4ZZLN0geeCN7fSMFXmNHZmIRURi9eFoSppOCDJ6	Aurore67@hotmail.com	1	e58e3d75-0258-471c-864b-b062b3995855
d8de4772-4554-4a68-93f8-6c0edb1dfdd2	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Thelma_Heidenreich46	$2b$10$p98zq39iN7llL4IeNLD1vO1K4MaUJX.PFi3yR70hymnBT4vGNC8v2	Demetris30@gmail.com	1	547dbe76-bd8b-4732-9b15-3b21589b3155
0cf6a411-d3b8-49e5-aaa4-f669818ca59d	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Flo.Casper	$2b$10$vj4gReDwzymp6ETf2NWbUOfYOdsg7l/INp0inp68Iac./38spwSvK	Letha11@gmail.com	1	a6e96e86-6b6a-49c8-af43-e0849febaa56
6308f72e-e15d-44e2-9c01-b3700052cac3	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Linnie71	$2b$10$IduEESLph/nk65CGmjYhye0Il353gXkW/41sYAHfSviSdUY18NCqO	Ottis_OHara24@hotmail.com	1	5d506773-4df1-4d6f-94de-edae348f4246
513e2058-a6f0-4f61-a79a-c4b6a8cbaa12	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Thomas_Hirthe	$2b$10$OV3DwrJ9zIZVsiUftNxmd.zsLrl.SpBUI0bA8UwEKyQXVsNd9zmgO	Kirsten_Koepp15@gmail.com	1	fa228429-c51e-411e-8479-5f3b66c1a593
12a6f503-2d83-4ab1-b3d1-482de0cc2402	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Brain81	$2b$10$FOqHxiQFVqbsSDWXuG0BHuGNN5W6jo2xHiqsu2JrxhK0gVAsO8Alu	Cassandra.Stamm92@hotmail.com	1	e2615210-7b7c-4e40-94e7-c59a9490698e
84d19511-79a8-41f5-b989-8ef8f95e440f	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Emilie55	$2b$10$2SKtY6mux9Lnye2ZlhC2deHGv8SNZ.8zpP.OmB/4f77O8TJ5BKx0.	Kayli_Halvorson22@gmail.com	1	40d85ebe-6b6c-4cad-8272-46c8cc902653
ae59bbe4-a52b-4b9f-b31d-e6f368c66dd5	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Shirley_Tromp	$2b$10$POd.Xw76nwK0X9U8B0SwAeZLE3IFAMRH2I5TwHiVFGq5lX8//9wpC	Dejuan28@yahoo.com	1	ffd48648-2b8f-430c-be27-eecb369d9c5d
4e928bbb-18ee-46ff-9fc2-1b9b7652f581	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Alexandra74	$2b$10$9p.fEBSD6KrKzDRsOR9Yg.ccDYHSJNP06f.1jcJdtMj/OVHXEjJNe	Demetris_Bergstrom72@hotmail.com	1	71dc5aa6-7e0d-4540-898a-64f6f36d40a5
05a216cc-5dad-4bcd-b991-c1a4d02ef7d6	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	Domingo_Homenick5	$2b$10$ADnMQBVPZcEANGR/2.LdTuxmfi9MTtNINwCL1yZwMK2uug3bCJkva	Fernando_Graham@gmail.com	1	17fe1fa2-b340-48a0-b042-b3ed51c86cbb
\.


--
-- Data for Name: user_games; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_games (id, "createdAt", "updatedAt", league_of_legends) FROM stdin;
1cbbc1e0-fde6-458f-a59e-5dd3f99a3784	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
77e1360d-59b9-4407-aa2f-39d912af03db	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
7ef93a7d-0d16-4bff-abbb-a5e8f3d28864	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
b676168f-ebf4-46b9-bad0-5466555b0f11	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
d4e62c99-de1c-45b9-a1d0-06b253e820d5	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
d72cfc50-be98-4d57-9708-26fba795a270	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
f09649b2-4beb-435f-aa73-40a985a53b97	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
72ca8f1c-8967-4667-be84-02011704a2c7	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
bbcdd410-1d3e-412f-9edb-b8dca223b5df	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
05cdb0c1-6652-4656-aed8-89211cea81c3	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
003918db-e31b-4aab-9648-9e00577af32a	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
e58e3d75-0258-471c-864b-b062b3995855	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
547dbe76-bd8b-4732-9b15-3b21589b3155	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
a6e96e86-6b6a-49c8-af43-e0849febaa56	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
5d506773-4df1-4d6f-94de-edae348f4246	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
fa228429-c51e-411e-8479-5f3b66c1a593	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
e2615210-7b7c-4e40-94e7-c59a9490698e	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
40d85ebe-6b6c-4cad-8272-46c8cc902653	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
ffd48648-2b8f-430c-be27-eecb369d9c5d	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
71dc5aa6-7e0d-4540-898a-64f6f36d40a5	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
17fe1fa2-b340-48a0-b042-b3ed51c86cbb	2021-10-15 15:00:03.191421	2021-10-15 15:00:03.191421	\N
\.


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
-- Name: league_user PK_d6fc908361d6a973bc40e7b15f4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.league_user
    ADD CONSTRAINT "PK_d6fc908361d6a973bc40e7b15f4" PRIMARY KEY (id);


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
-- Name: user FK_37166bf4410012c8cd156f5197f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_37166bf4410012c8cd156f5197f" FOREIGN KEY ("gamesId") REFERENCES public.user_games(id);


--
-- Name: user_games FK_8fbc5c0b9919195f3067d4b1305; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_games
    ADD CONSTRAINT "FK_8fbc5c0b9919195f3067d4b1305" FOREIGN KEY (league_of_legends) REFERENCES public.league_user(id);


--
-- PostgreSQL database dump complete
--


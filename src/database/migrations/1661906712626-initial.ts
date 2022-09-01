import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1661906712626 implements MigrationInterface {
  name = 'initial1661906712626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "league_room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "description" character varying(1500), "region" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "demanded_positions" character varying array NOT NULL, CONSTRAINT "PK_004aed4e743b926af7dc14a34d3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_league_room_date" ON "league_room" ("date") `,
    );
    await queryRunner.query(
      `CREATE TABLE "league_room_application" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "status" integer NOT NULL, "appliedForPosition" character varying NOT NULL, "isOwner" boolean NOT NULL DEFAULT false, "leagueUserId" uuid NOT NULL, "roomId" uuid NOT NULL, CONSTRAINT "PK_3c0d9c048e63880d9ec77a47ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_league_room_application_user" ON "league_room_application" ("leagueUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_league_room_application_room" ON "league_room_application" ("roomId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "league_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "summonerId" character varying(255) NOT NULL, "region" character varying NOT NULL, "mainPosition" character varying NOT NULL, "secondaryPosition" character varying NOT NULL, CONSTRAINT "PK_12289821a4080fad99b3870a165" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "league_of_legends" uuid, CONSTRAINT "REL_8fbc5c0b9919195f3067d4b130" UNIQUE ("league_of_legends"), CONSTRAINT "PK_c9cc6a3afdc17ef440abea3b055" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "type" character varying(255) NOT NULL, "handlers" character varying array NOT NULL, "status" character varying(255) NOT NULL, "retries" smallint NOT NULL DEFAULT '0', "data" json NOT NULL DEFAULT '{}', "userId" uuid NOT NULL, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "username" character varying(500) NOT NULL, "password" character varying(500) NOT NULL, "email" character varying(100) NOT NULL, "role" integer NOT NULL DEFAULT '1', "reset_password_verification_code" character varying(7), "reset_password_verification_code_sent_at" TIMESTAMP, "reset_password_verification_code_verified_at" TIMESTAMP, "gamesId" uuid, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_37166bf4410012c8cd156f5197" UNIQUE ("gamesId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "room_chat_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "message" character varying(5000) NOT NULL, "room_id" uuid NOT NULL, "authorId" uuid, CONSTRAINT "PK_a7f9ec8bdb2eef963aa22290a55" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "chat_message_room_id" ON "room_chat_message" ("room_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ticket" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "message" character varying(5000) NOT NULL, "type" smallint NOT NULL, "author_name" character varying(100), "author_email" character varying(100), CONSTRAINT "PK_d9a0835407701eb86f874474b7c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "name" character varying(200) NOT NULL, "description" character varying(500), "logo" character varying(500) NOT NULL, "href" character varying, "isActive" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6572e2a84c4c5d72a9227e0b894" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "league_room_application" ADD CONSTRAINT "FK_d28e76e330cc23d67c91d1dbe8f" FOREIGN KEY ("leagueUserId") REFERENCES "league_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "league_room_application" ADD CONSTRAINT "FK_e965e09191e9c862fe9bbef3d24" FOREIGN KEY ("roomId") REFERENCES "league_room"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_games" ADD CONSTRAINT "FK_8fbc5c0b9919195f3067d4b1305" FOREIGN KEY ("league_of_legends") REFERENCES "league_user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_37166bf4410012c8cd156f5197f" FOREIGN KEY ("gamesId") REFERENCES "user_games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "room_chat_message" ADD CONSTRAINT "FK_dba01fd7c2a487e6691227c06d4" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "room_chat_message" DROP CONSTRAINT "FK_dba01fd7c2a487e6691227c06d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_37166bf4410012c8cd156f5197f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_1ced25315eb974b73391fb1c81b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_games" DROP CONSTRAINT "FK_8fbc5c0b9919195f3067d4b1305"`,
    );
    await queryRunner.query(
      `ALTER TABLE "league_room_application" DROP CONSTRAINT "FK_e965e09191e9c862fe9bbef3d24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "league_room_application" DROP CONSTRAINT "FK_d28e76e330cc23d67c91d1dbe8f"`,
    );
    await queryRunner.query(`DROP TABLE "game_config"`);
    await queryRunner.query(`DROP TABLE "ticket"`);
    await queryRunner.query(`DROP INDEX "public"."chat_message_room_id"`);
    await queryRunner.query(`DROP TABLE "room_chat_message"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TABLE "user_games"`);
    await queryRunner.query(`DROP TABLE "league_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_league_room_application_room"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_league_room_application_user"`,
    );
    await queryRunner.query(`DROP TABLE "league_room_application"`);
    await queryRunner.query(`DROP INDEX "public"."idx_league_room_date"`);
    await queryRunner.query(`DROP TABLE "league_room"`);
  }
}

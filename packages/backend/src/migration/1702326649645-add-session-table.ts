import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSessionTable1702326649645 implements MigrationInterface {
    name = 'AddSessionTable1702326649645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" character varying(32) NOT NULL, "token" character varying(64) NOT NULL, "active" boolean NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")); COMMENT ON COLUMN "session"."createdAt" IS 'The created date of the OAuth token'; COMMENT ON COLUMN "session"."token" IS 'The authorization token'; COMMENT ON COLUMN "session"."active" IS 'Whether or not the token has been activated (i.e. 2fa has been confirmed)'`);
        await queryRunner.query(`CREATE INDEX "IDX_232f8e85d7633bd6ddfad42169" ON "session" ("token") `);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_232f8e85d7633bd6ddfad42169"`);
        await queryRunner.query(`DROP TABLE "session"`);
    }
}

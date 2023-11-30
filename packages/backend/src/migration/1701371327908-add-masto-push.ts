import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMastoPush1701371327908 implements MigrationInterface {
    name = 'AddMastoPush1701371327908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "push_subscription" ("id" character varying(32) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" character varying(32) NOT NULL, "tokenId" character varying(32) NOT NULL, "data" jsonb NOT NULL, "types" jsonb NOT NULL, "policy" character varying(32) NOT NULL, CONSTRAINT "PK_07fc861c0d2c38c1b830fb9cb5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a227cbc3dc43c0d56117ea156" ON "push_subscription" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e062a101e77e5992259b10b428" ON "push_subscription" ("tokenId") `);
        await queryRunner.query(`ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_8a227cbc3dc43c0d56117ea1563" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "push_subscription" ADD CONSTRAINT "FK_e062a101e77e5992259b10b4280" FOREIGN KEY ("tokenId") REFERENCES "oauth_token"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_e062a101e77e5992259b10b4280"`);
        await queryRunner.query(`ALTER TABLE "push_subscription" DROP CONSTRAINT "FK_8a227cbc3dc43c0d56117ea1563"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e062a101e77e5992259b10b428"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a227cbc3dc43c0d56117ea156"`);
        await queryRunner.query(`DROP TABLE "push_subscription"`);
    }

}

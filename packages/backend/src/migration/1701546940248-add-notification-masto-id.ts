import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationMastoId1701546940248 implements MigrationInterface {
    name = 'AddNotificationMastoId1701546940248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" ADD "mastoId" SERIAL NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0ee0c7254e5612a8129251997e" ON "notification" ("mastoId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_0ee0c7254e5612a8129251997e"`);
        await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "mastoId"`);
    }
}

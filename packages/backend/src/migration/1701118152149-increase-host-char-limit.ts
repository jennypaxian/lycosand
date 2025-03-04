import { MigrationInterface, QueryRunner } from "typeorm"

export class IncreaseHostCharLimit1701118152149 implements MigrationInterface {
    name = 'IncreaseHostCharLimit1701118152149';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drive_file" ALTER COLUMN "userHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "host" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "userHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ALTER COLUMN "keyId" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "emoji" ALTER COLUMN "host" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "userHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "replyUserHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "renoteUserHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "instance" ALTER COLUMN "host" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "instance" ALTER COLUMN "iconUrl" TYPE character varying(4096)`);
        await queryRunner.query(`ALTER TABLE "instance" ALTER COLUMN "faviconUrl" TYPE character varying(4096)`);
        await queryRunner.query(`ALTER TABLE "poll" ALTER COLUMN "userHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" ALTER COLUMN "targetUserHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" ALTER COLUMN "reporterHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "following" ALTER COLUMN "followeeHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "following" ALTER COLUMN "followerHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "follow_request" ALTER COLUMN "followeeHost" TYPE character varying(512)`);
        await queryRunner.query(`ALTER TABLE "follow_request" ALTER COLUMN "followerHost" TYPE character varying(512)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drive_file" ALTER COLUMN "userHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "host" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "userHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "user_publickey" ALTER COLUMN "keyId" TYPE character varying(256)`);
        await queryRunner.query(`ALTER TABLE "emoji" ALTER COLUMN "host" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "userHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "replyUserHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "note" ALTER COLUMN "renoteUserHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "instance" ALTER COLUMN "host" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "instance" ALTER COLUMN "iconUrl" TYPE character varying(256)`);
        await queryRunner.query(`ALTER TABLE "instance" ALTER COLUMN "faviconUrl" TYPE character varying(256)`);
        await queryRunner.query(`ALTER TABLE "poll" ALTER COLUMN "userHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" ALTER COLUMN "targetUserHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "abuse_user_report" ALTER COLUMN "reporterHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "following" ALTER COLUMN "followeeHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "following" ALTER COLUMN "followerHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "follow_request" ALTER COLUMN "followeeHost" TYPE character varying(128)`);
        await queryRunner.query(`ALTER TABLE "follow_request" ALTER COLUMN "followerHost" TYPE character varying(128)`);
    }
}

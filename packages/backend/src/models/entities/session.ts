import { Entity, PrimaryColumn, Column, Index, ManyToOne, JoinColumn } from "typeorm";
import { id } from "../id.js";
import { OAuthApp } from "@/models/entities/oauth-app.js";
import { User } from "@/models/entities/user.js";

@Entity('session')
export class Session {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone", {
		comment: "The created date of the OAuth token",
	})
	public createdAt: Date;

	@Column(id())
	public userId: User["id"];

	@ManyToOne(() => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User;

	@Index()
	@Column("varchar", {
		length: 64,
		comment: "The authorization token",
	})
	public token: string;

	@Column("boolean", {
		comment: "Whether or not the token has been activated (i.e. 2fa has been confirmed)",
	})
	public active: boolean;
}

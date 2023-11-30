import {
	PrimaryColumn,
	Entity,
	Index,
	JoinColumn,
	Column,
	ManyToOne,
} from "typeorm";
import { User } from "./user.js";
import { id } from "../id.js";
import { OAuthToken } from "@/models/entities/oauth-token.js";

@Entity()
export class PushSubscription {
	@PrimaryColumn(id())
	public id: string;

	@Column("timestamp with time zone")
	public createdAt: Date;

	@Index()
	@Column(id())
	public userId: User["id"];

	@ManyToOne((type) => User, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public user: User | null;

	@Index({ unique: true })
	@Column(id())
	public tokenId: OAuthToken["id"];

	@ManyToOne((type) => OAuthToken, {
		onDelete: "CASCADE",
	})
	@JoinColumn()
	public token: OAuthToken | null;

	@Column("jsonb")
	public data: MastodonEntity.PushData;

	@Column("jsonb")
	public types: MastodonEntity.PushTypes;

	@Column("varchar", {
		length: 32,
	})
	public policy: MastodonEntity.PushPolicy;
}

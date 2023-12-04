export type ParsedAcct = {
	username: string;
	host: string | null;
}

export class Acct {
	public username: string;
	public host: string | null;

	constructor(username: string, host: string | null) {
		this.username = username;
		this.host = host;
	}

	public static parse(acct: string): ParsedAcct {
		if (acct.startsWith("@")) acct = acct.slice(1);
		const split = acct.split("@", 2);
		return { username: split[0], host: split[1] ?? null };
	}

	public static fromParsed(parsed: ParsedAcct) {
		return new this(parsed.username, parsed.host);
	}

	public static toString(parsed: ParsedAcct) {
		return this.fromParsed(parsed).toString();
	}

	public toString(): string {
		return this.host == null ? this.username : `${this.username}@${this.host}`;
	}
}

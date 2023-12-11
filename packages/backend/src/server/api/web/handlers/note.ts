import { ILocalUser } from "@/models/entities/user.js";
import { NoteResponse } from "@/server/api/web/entities/note.js";
import { Notes } from "@/models/index.js";
import { notFound } from "@hapi/boom";

export class NoteHandler {
	static async getNote(me: ILocalUser | null, id: string): Promise<NoteResponse> {
		const note = await Notes.findOneBy({ id });
		if (!note) throw notFound('No such user');

		return note;
	}

	static async encode(me: ILocalUser | null, id: string): Promise<NoteResponse | null> {

	}
}

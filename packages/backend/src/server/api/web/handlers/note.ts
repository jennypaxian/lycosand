import { ILocalUser } from "@/models/entities/user.js";
import { NoteResponse } from "@/server/api/web/entities/note.js";
import { Notes } from "@/models/index.js";
import { Boom, notFound, internal } from "@hapi/boom";
import { Note } from "@/models/entities/note.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";
import isQuote from "@/misc/is-quote.js";

export class NoteHandler {
	static async getNoteOrFail(id: string, error: Boom = internal('No such note')): Promise<Note> {
		const note = await this.getNote(id);
		if (!note) throw error;
		return note;
	}

	static async getNote(id: string): Promise<Note | null> {
		return Notes.findOneBy({ id });
	}

	static async encode(note: Note, me: ILocalUser | null, recurse: number = 2): Promise<NoteResponse | null> {
		if (!await Notes.isVisibleForMe(note, me?.id ?? null)) return null;

		return {
			id: note.id,
			text: note.text,
			user: note.user ? await UserHandler.encode(note.user, me) : await UserHandler.getUser(me, note.userId),
			renote: !isQuote(note) && note.renoteId && recurse > 0 ? await this.encode(note.renote ?? await this.getNoteOrFail(note.renoteId), me, 0) : undefined,
			quote: isQuote(note) && note.renoteId && recurse > 0 ? await this.encode(note.renote ?? await this.getNoteOrFail(note.renoteId), me, --recurse) : undefined,
			reply: note.replyId && recurse > 0 ? await this.encode(note.renote ?? await this.getNoteOrFail(note.replyId), me, 0) : undefined,
		};
	}

	static async encodeOrFail(note: Note, me: ILocalUser | null, error: Boom = internal("Cannot encode note not visible for user")): Promise<NoteResponse> {
		const result = await this.encode(note, me);
		if (!result) throw error;
		return result;
	}

	static async encodeMany(notes: Note[], me: ILocalUser | null): Promise<NoteResponse[]> {
		return Promise.all(notes.map(n => this.encodeOrFail(n, me)));
	}
}

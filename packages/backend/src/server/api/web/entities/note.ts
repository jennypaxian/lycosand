import { Note } from "@/models/entities/note.js";
import { UserResponse } from "@/server/api/web/entities/user.js";

export type NoteResponse = {
    id: Note["id"];
    text: string | null;
    user: UserResponse;
    reply: NoteResponse | undefined | null; // Undefined if no record, null if not visible
    renote: NoteResponse | undefined | null; // Undefined if no record, null if not visible
};

export type TimelineResponse = {
    notes: NoteResponse[];
    pagination: {}; //TODO
};

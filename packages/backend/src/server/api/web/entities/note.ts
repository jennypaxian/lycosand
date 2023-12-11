import { Note } from "@/models/entities/note.js";

namespace WebEntities {
    export type NoteResponse = {
        id: Note["id"];

    };

    export type TimelineResponse = {
        notes: NoteResponse[],

    };
}

import { Note } from "@/models/entities/note.js";

export type NoteResponse = {} & Note;
export type TimelineResponse = NoteResponse[];

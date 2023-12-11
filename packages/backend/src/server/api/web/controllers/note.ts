import { Controller, Get, CurrentUser, Params, } from "@iceshrimp/koa-openapi";
import type { ILocalUser } from "@/models/entities/user.js";
import { NoteHandler } from "@/server/api/web/handlers/note.js";
import { NoteResponse } from "@/server/api/web/entities/note.js";
import { notFound } from "@hapi/boom";

@Controller('/note')
export class NoteController {
    @Get('/:id')
    async getNote(
        @CurrentUser() me: ILocalUser | null,
        @Params('id') id: string,
    ): Promise<NoteResponse> {
        return NoteHandler.getNoteOrFail(id, notFound("No such note"))
            .then(note => NoteHandler.encodeOrFail(note, me));
    }
}

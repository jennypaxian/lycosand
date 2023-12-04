import { Endpoints } from "./api.types.js";
import Stream, { Connection } from "./streaming.js";
import { Channels } from "./streaming.types.js";
import { Acct } from "./acct.js";
import * as consts from "./consts.js";


export type { Endpoints, Channels }
export { Acct, Stream, Connection as ChannelConnection };

export const permissions = consts.permissions;
export const notificationTypes = consts.notificationTypes;
export const noteVisibilities = consts.noteVisibilities;
export const ffVisibility = consts.ffVisibility;

// api extractor not supported yet
//export * as api from './api';
//export * as entities from './entities';
import * as api from "./api.js";
import * as entities from "./entities.js";
export { api, entities };

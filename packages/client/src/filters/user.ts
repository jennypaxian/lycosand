import * as misskey from "@/iceshrimp-js";
import { Acct } from "@/iceshrimp-js"
import { url } from "@/config";
import { ParsedAcct } from "@/iceshrimp-js/acct.js";

export const acct = (user: ParsedAcct) => {
	return new Acct(user.username, user.host).toString();
};

export const userName = (user: misskey.entities.User) => {
	return user.name || user.username;
};

export const userPage = (user: misskey.Acct, path?, absolute = false) => {
	return `${absolute ? url : ""}/@${acct(user)}${path ? `/${path}` : ""}`;
};

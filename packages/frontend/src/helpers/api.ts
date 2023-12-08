import { get as kvGet } from "idb-keyval";
import { KvAccount } from "../entities/keyval.ts";

export async function api(endpoint: string, body?: object) {
    const token = (await getCurrentAccount())?.token ?? null;
    const request = {
        method: body ? 'POST' : 'GET',
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
        body: body ? JSON.stringify(body) : undefined
    };

    return fetch(endpoint, request).then(res => res.json());
}

//FIXME: cache this somewhere?
async function getCurrentAccount(): Promise<KvAccount | null> {
    const currentAccountId = localStorage.getItem('accountId');
    if (currentAccountId === null) return null;
    const accounts = await kvGet<KvAccount[] | null>("accounts");
    if (!accounts) return null;
    return accounts.find(p => p.id === currentAccountId) ?? null;
}

import type { SelectQueryBuilder } from "typeorm";

export function makePaginationQuery<T>(
	q: SelectQueryBuilder<T>,
	minId?: string,
	maxId?: string,
	sinceDate?: number,
	untilDate?: number,
) {
	if (minId && maxId) {
		q.andWhere(`${q.alias}.id > :sinceId`, { sinceId: minId });
		q.andWhere(`${q.alias}.id < :untilId`, { untilId: maxId });
		q.orderBy(`${q.alias}.id`, "DESC");
	} else if (minId) {
		q.andWhere(`${q.alias}.id > :sinceId`, { sinceId: minId });
		q.orderBy(`${q.alias}.id`, "ASC");
	} else if (maxId) {
		q.andWhere(`${q.alias}.id < :untilId`, { untilId: maxId });
		q.orderBy(`${q.alias}.id`, "DESC");
	} else if (sinceDate && untilDate) {
		q.andWhere(`${q.alias}.createdAt > :sinceDate`, {
			sinceDate: new Date(sinceDate),
		});
		q.andWhere(`${q.alias}.createdAt < :untilDate`, {
			untilDate: new Date(untilDate),
		});
		q.orderBy(`${q.alias}.createdAt`, "DESC");
	} else if (sinceDate) {
		q.andWhere(`${q.alias}.createdAt > :sinceDate`, {
			sinceDate: new Date(sinceDate),
		});
		q.orderBy(`${q.alias}.createdAt`, "ASC");
	} else if (untilDate) {
		q.andWhere(`${q.alias}.createdAt < :untilDate`, {
			untilDate: new Date(untilDate),
		});
		q.orderBy(`${q.alias}.createdAt`, "DESC");
	} else {
		q.orderBy(`${q.alias}.id`, "DESC");
	}
	return q;
}

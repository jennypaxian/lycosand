import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createGenerator } from "@iceshrimp/ts-json-schema-generator";

export function genSchema() {
	const _filename = fileURLToPath(import.meta.url);
	const _dirname = dirname(_filename);

	const config = {
		path: `${_dirname}/../../../../../src/server/api/web/entities/*.ts`,
		tsconfig: `${_dirname}/../../../../../tsconfig.json`,
		skipTypeCheck: true,
		discriminatorType: 'open-api' as const,
	};

	const pre = new Date().getTime();
	const schema = createGenerator(config).createSchema('*');
	console.log(`Generated JSON Schema in ${new Date().getTime() - pre}ms`);
	return schema;
}

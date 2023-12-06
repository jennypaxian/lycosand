export const ErrorHandlingMiddleware = async (err: any, ctx: any) => {
	if (err.isBoom) {
		const error = err.output.payload;
		error.errorDetails = error.statusCode >= 500 ? undefined : err.data;
		ctx.body = error;
		ctx.status = error.statusCode;
		if (error.statusCode >= 500) console.error(err);
	} else {
		ctx.body = {error: 'Internal Server Error'};
		ctx.status = 500;
		console.error(err);
	}
}

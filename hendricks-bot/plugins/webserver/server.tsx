import path from 'path';

import express, { static as staticServe } from 'express';
import { logger } from '.';

export function startServer() {
	const PORT = process.env.PORT || 3000;
	const app = express();

	app.use(
		staticServe(path.resolve(__dirname, '.', 'dist'), { maxAge: '30d' })
	);

	app.listen(PORT, () => {
		logger!.info(`Server is open on http://localhost:${PORT}/`);
	});
}

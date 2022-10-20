import dotenv from 'dotenv';
// load env
dotenv.config();

import './client';

import logger from './logger';

const { LOG_LEVEL = 'error' } = process.env;

if (LOG_LEVEL === 'verbose') {
	import('@discordjs/voice').then(({ generateDependencyReport }) => {
		logger.verbose(generateDependencyReport());
	});
}

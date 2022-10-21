import dotenv from 'dotenv';
// load env
dotenv.config();

import events from './events';
import logger from './logger';

import './client';
import pluginManager from './plugins';
import CommandRegistry from './CommandRegistry';

const { LOG_LEVEL = 'error' } = process.env;

if (LOG_LEVEL === 'verbose') {
	import('@discordjs/voice').then(({ generateDependencyReport }) => {
		logger.verbose(generateDependencyReport());
	});
}

// after plugins have loaded, start plugins
events.on('plugins:init', () => {
	logger.info(`🧩 ${pluginManager.plugins.length} Plugins initialized`);

	events.emit('plugins:start');
});

events.on('register:commands', () => {
	logger.info(`🗯  ${CommandRegistry.commands.length} Commands registered`);
});

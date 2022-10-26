import dotenv from 'dotenv';
// load env
dotenv.config();

import events from './events';
import logger from './logger';

import './client';
import pluginManager from './plugins';
import CommandRegistry from './CommandRegistry';

// after plugins have loaded, start plugins
events.on('plugins:init', () => {
	logger.info(`🧩 ${pluginManager.plugins.length} Plugins initialized`);

	events.emit('plugins:start');
});

events.on('register:commands', () => {
	logger.info(`💬 ${CommandRegistry.commands.length} Commands registered`);
});

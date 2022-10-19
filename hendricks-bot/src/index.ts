import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
// load env
dotenv.config();

import events from './events';
import logger from './logger';
import LocalPluginLoader from './plugin-system/PluginLoader/LocalPluginLoader';
import PluginManager from './plugin-system/PluginManager';

const { TOKEN: token, LOG_LEVEL = 'error' } = process.env;

if (LOG_LEVEL === 'verbose') {
	import('@discordjs/voice').then(({ generateDependencyReport }) => {
		logger.verbose(generateDependencyReport());
	});
}

// create the client and its associated variables
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildVoiceStates,
	],
});

// load events
events.forEach((event) => {
	const f = async (...args: any[]) => await event.execute(client, ...args);
	if (event.once) client.once(event.name, f);
	else client.on(event.name, f);
});

// start the client
client.login(token);

// start the plugins
PluginManager.start(
	new LocalPluginLoader({
		pluginsPath: path.join(__dirname, 'plugins'),
	})
);

export { client };

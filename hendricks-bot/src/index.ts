import { Client } from 'discord.js';
import Scope from './types/Scope';

import { GatewayIntentBits } from 'discord.js';

import events from './events';

// load env
require('dotenv').config();
const { TOKEN: token, LOG_LEVEL = 'error' } = process.env;

if (LOG_LEVEL === 'verbose') {
	import('@discordjs/voice').then(({ generateDependencyReport }) => {
		console.log(generateDependencyReport());
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
const clientExtras: Scope = {
	player: undefined,
	queue: [],
};

// load events
events.forEach((event) => {
	const f = async (...args: any[]) =>
		await event.execute(clientExtras, client, ...args);
	if (event.once) client.once(event.name, f);
	else client.on(event.name, f);
});

// start the client
client.login(token);

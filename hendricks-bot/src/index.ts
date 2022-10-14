import { AudioPlayer } from '@discordjs/voice';
import { Client } from 'discord.js';
import { ClientExtras } from './extra';

const { GatewayIntentBits, ClientUser } = require('discord.js');
const { createAudioPlayer } = require('@discordjs/voice');

import events from './events/events';

const { generateDependencyReport } = require('@discordjs/voice');

console.log(generateDependencyReport());

// load env
require('dotenv').config()
const token = process.env['TOKEN'];

// create the client and its associated variables
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const clientExtras: ClientExtras = {
	player: undefined,
	queue: []
};

// load events
events.forEach(event => {
	const f = async (...args: any[]) => await event.execute(clientExtras, client, ...args);
	if (event.once)
		client.once(event.name, f);
	else
		client.on(event.name, f);
});

// start the client
client.login(token);

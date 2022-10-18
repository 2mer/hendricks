import { Client } from 'discord.js';
import logger from '../logger';
import { init } from '../runBlocks/latexBlock';
import Event from '../types/Event';

export default {
	name: 'ready',
	once: true,
	execute: async (client: Client) => {
		await init();
		logger.info(`Ready! Logged in as ${client.user!.tag}`);
	},
} as Event;

import { Client, GatewayIntentBits } from 'discord.js';

export default function createClient({ token }: { token: string }) {

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
	
	// start the client
	client.login(token);

	return client;
}

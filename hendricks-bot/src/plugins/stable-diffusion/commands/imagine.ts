import {
	SlashCommandBuilder,
	ChatInputCommandInteraction,
	Client,
	ClientEvents,
} from 'discord.js';
import {
	boolOption,
	intOption,
	stringOption,
} from '../../../util/commandUtils';
import tasks from '../tasks';
import { imageRequestAndView } from '../util/commons';
import axios from 'axios';
import logger from '../../../logger';

const slash = new SlashCommandBuilder()
	.setName('imagine')
	.setDescription('Generates an image based on the given prompt')
	.addStringOption(stringOption('prompt', 'the thing to imagine', true))
	.addBooleanOption(boolOption('plms', 'use plms sampling', false))
	.addIntegerOption(intOption('n_iter', 'sample this often', false))
	.addIntegerOption(intOption('h', 'image height, in pixels', false))
	.addIntegerOption(intOption('w', 'image width, in pixels', false))
	.addIntegerOption(intOption('c', 'latent channels', false))
	.addIntegerOption(intOption('f', 'downsampling factor', false))
	.addIntegerOption(
		intOption(
			'n_samples',
			'how many samples to produce for each given prompt. A.k.a batch size.',
			false
		)
	)
	.addIntegerOption(
		intOption('seed', 'the seed (for reproducible sampling)', false)
	);

async function execute<K extends keyof ClientEvents>(
	client: Client,
	...args: ClientEvents[K]
) {
	const interaction = args[0] as ChatInputCommandInteraction;

	// load env
	const serverIp = process.env['SERVER_IP'];
	const serverPort = process.env['SERVER_PORT'];
	const addr = `${serverIp}:${serverPort}`;

	// const client = interaction.client;
	const channel = interaction.channel;
	const user = interaction.user;
	const guildId = interaction.guildId;

	// check that there is a text channel
	if (!channel) {
		await interaction.reply(
			`Interaction.channel is null. This shouldn't have happened.`
		);
		return;
	}

	if (!guildId) {
		await interaction.reply(
			`Interaction.guildId is null. This shouldn't have happened.`
		);
		return;
	}

	// check that the prompt is valid
	const prompt = interaction.options.getString('prompt');
	if (!prompt) {
		await interaction.reply(`Could not get prompt`);
		return;
	}

	// get the rest of the options (these can be null)
	const plms = interaction.options.getBoolean('plms');
	const n_iter = interaction.options.getInteger('n_iter');
	const h = interaction.options.getInteger('h');
	const w = interaction.options.getInteger('w');
	const c = interaction.options.getInteger('c');
	const f = interaction.options.getInteger('f');
	const n_samples = interaction.options.getInteger('n_samples');
	const seed = interaction.options.getInteger('seed');

	// create the request object
	const req: any = {
		prompt,
		plms,
		n_iter,
		h,
		w,
		c,
		f,
		n_samples,
		seed,
	};

	// remove the null keys
	for (const key in req)
		if (req[key] === null || req[key] === undefined) delete req[key];

	try {
		// send the request to the AI server
		logger.verbose(`sending request ${prompt}`);
		const { data: res } = await axios.post(`http://${addr}/gen/`, req);
		const [id, number_in_queue] = res.split(' ');
		logger.verbose(
			`initial response: id=${id}, number in queue=${number_in_queue}`
		);

		// add the id to the tasks collection
		tasks.add({
			guildId,
			id,
			prompt,
			task: `imagine: ${prompt}`,
			author: user.username,
		});

		// notify the discord server that the prompt has been accepted
		await interaction.reply(
			`# in queue: ${number_in_queue}, prompt accepted: \`${prompt}\``
		);

		// wait for the server to reply with a ready message
		await imageRequestAndView(addr, id, user, channel, prompt, 6, 3);
	} catch (err) {
		logger.error('error!');
		logger.error(err);
		await channel.send('unknown error');
	}
}

export default {
	slash,
	execute,
};

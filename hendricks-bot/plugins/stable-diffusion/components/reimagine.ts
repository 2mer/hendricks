import { imageRequestAndView } from '@hendricks/plugins/stable-diffusion/util/commons';
import logger from '@hendricks/logger';
import axios from 'axios';
import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';
import tasks from '../tasks';

export default async function reimagine(
	interaction: ButtonInteraction | ModalSubmitInteraction,
	imageNumber: number,
	id: string,
	prompt: string | undefined,
	strength: string | number | undefined
) {
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

	const task = tasks.get(guildId, id);
	if (!task) {
		await interaction.reply(
			`No task found for this combination of guildId and id. This is probably a bug.`
		);
		return;
	}

	// create the request object
	const req: any = {
		prompt: prompt || task.prompt,
		from_id: parseInt(id),
		image_number: imageNumber,
		strength: 0.8,
	};
	if (strength) {
		if (typeof strength === 'string') req.strength = parseInt(strength);
		if (typeof strength === 'number') req.strength = strength;
	}

	// remove the null keys
	for (const key in req)
		if (req[key] === null || req[key] === undefined) delete req[key];

	try {
		// send the request to the AI server
		logger.verbose(`sending regeneration`);
		const { data: res } = await axios.post(`http://${addr}/regen/`, req);
		const [id, number_in_queue] = res.split(' ');
		logger.verbose(
			`initial response: id=${id}, number in queue=${number_in_queue}`
		);

		// add the id to the tasks collection
		tasks.add({
			guildId,
			id,
			prompt: req.prompt,
			task: `re-imagine: ${req.prompt}`,
			author: user.username,
		});

		// notify the discord server that the prompt has been accepted
		await interaction.reply(
			`# in queue: ${number_in_queue}, prompt accepted: \`${req.prompt}\``
		);

		// wait for the server to reply with a ready message
		await imageRequestAndView(addr, id, user, channel, task.task, 2, 2);
	} catch (err) {
		logger.error('error!');
		logger.error(err);
		await channel.send('unknown error');
	}
}

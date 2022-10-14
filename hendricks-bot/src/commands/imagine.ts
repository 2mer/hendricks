import { ChatInputCommandInteraction, Client, ClientEvents, Interaction, SlashCommandStringOption } from "discord.js";
import { ClientExtras } from "../extra";
import { boolOption, intOption, stringOption } from "./utils";

const { SlashCommandBuilder, AttachmentBuilder, Options } = require('discord.js');
const fs = require('fs')
const { default: axios } = require('axios');
const EventSource = require('eventsource')

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
	.addIntegerOption(intOption('n_samples', 'how many samples to produce for each given prompt. A.k.a batch size.', false))
	.addIntegerOption(intOption('seed', 'the seed (for reproducible sampling)', false));

async function execute<K extends keyof ClientEvents>(clientExtras: ClientExtras, client: Client, ...args: ClientEvents[K]) {
	const interaction = args[0] as ChatInputCommandInteraction;

	// load env
	const serverIp = process.env['SERVER_IP'];
	const serverPort = process.env['SERVER_PORT'];
	const addr = `${serverIp}:${serverPort}`;

	// const client = interaction.client;
	const channel = interaction.channel;
	const user = interaction.user;

	// check that there is a text channel
	if (!channel) {
		await interaction.reply(`Interaction.channel is null. This shouldn't have happened.`);
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
	let req: any = {
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
		if (req[key] === null || req[key] === undefined)
			delete req[key];

	try {
		// send the request to the AI server
		console.log(`sending request ${prompt}`);
		const { data: res } = await axios.post(`http://${addr}/gen/`, req);
		const [id, number_in_queue] = res.split(' ');
		console.log(`initial response: id=${id}, number in queue=${number_in_queue}`);

		// notify the discord server that the prompt has been accepted
		await interaction.reply(`# in queue: ${number_in_queue}, prompt accepted: \`${prompt}\``);

		// wait for the server to reply with a ready message
		const es = new EventSource(`http://${addr}/events/${id}`);
		es.onmessage = async (e: any) => {
			// an event has been received - the image is ready
			if (e.data == 'complete') {
				es.close();

				// request the image
				await channel.send(`<@${user.id}> Your dish is ready! It will be served shortly!`);

				console.log(`requesting: ${id}`)
				const req = {
					method: 'get',
					url: `http://${addr}/image/${id}`,
					responseType: 'stream',
				};

				axios(req).then(async (response: any) => {
					const data = response.data;
					const attachment = new AttachmentBuilder(data, { name: 'generated.png' });
					await channel.send({ content: `Here sir, your \`${prompt}\``, files: [attachment] });
				}).catch(async (err: any) => {
					await channel.send('error');
				})
			}
		}

		// event error
		es.onerror = async (err: any) => {
			await channel.send(`There was an error during image generation`);
			es.close();
		}
	} catch (err) {
		console.log('error!');
		console.error(err);
		await channel.send('unknown error');
	}
}

export default {
	slash,
	execute,
};

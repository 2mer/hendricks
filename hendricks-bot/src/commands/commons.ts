import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, TextBasedChannel, User } from "discord.js";
import { buttonDelete } from "../constants";

const { default: axios } = require('axios');
const EventSource = require('eventsource')


export function imageRequestAndView(addr: string, id: string, user: User, channel: TextBasedChannel, prompt: string, numOutImages: number, imagesPerRow: number) {
	const es = new EventSource(`http://${addr}/events/${id}`);
	es.onmessage = async (e: any) => {
		// an event has been received - the image is ready
		if (e.data.startsWith('complete')) {
			const seconds = e.data.substring(9);

			es.close();

			// request the image
			await channel.send(`<@${user.id}> Your dish is ready! It will be served shortly! It was created in ${seconds} seconds.`);

			console.log(`requesting: ${id}`);

			const req = {
				method: 'get',
				url: `http://${addr}/image/${id}`,
				responseType: 'stream',
			};

			const sendStart = Date.now();
			axios(req).then(async (response: any) => {
				const seconds = (Date.now() - sendStart) / 1000;

				// prepare the buttons
				const vRows: ButtonBuilder[][] = [[]];
				const uRows: ButtonBuilder[][] = [[]];
				let col = 0;
				let row = 0;
				for (let counter = 0; counter < numOutImages; counter++) {
					vRows[row].push(
						new ButtonBuilder()
							.setCustomId(`V${counter}-${id}`)
							.setLabel(`V${counter}`)
							.setStyle(ButtonStyle.Primary)
					);

					uRows[row].push(
						new ButtonBuilder()
							.setCustomId(`U${counter}-${id}`)
							.setLabel(`U${counter}`)
							.setStyle(ButtonStyle.Primary)
					);

					col++;
					if (col == imagesPerRow) {
						vRows.push([]);
						uRows.push([]);
						col = 0;
						row += 1;
					}
				}

				const rows: ActionRowBuilder<ButtonBuilder>[] = [];
				vRows.filter(row => row.length > 0).forEach(row => rows.push(
					new ActionRowBuilder<ButtonBuilder>().addComponents(row),
				));
				uRows.filter(row => row.length > 0).forEach(row => rows.push(
					new ActionRowBuilder<ButtonBuilder>().addComponents(row),
				));
				rows.push(
					new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId(buttonDelete)
								.setLabel(buttonDelete)
								.setStyle(ButtonStyle.Danger)
						),
				);

				// send the image
				const data = response.data;
				const attachment = new AttachmentBuilder(data, { name: 'generated.png' });
				await channel.send({
					content: `Here sir, your \`${prompt}\`, sent in ${seconds}s`,
					files: [attachment],
					components: rows,
				});
			}).catch(async (err: any) => {
				console.log('axios error');
				console.log(err);
				await channel.send('axios error');
			})
		}
	}

	// event error
	es.onerror = async (err: any) => {
		await channel.send(`There was an error during image generation`);
		es.close();
	}
}

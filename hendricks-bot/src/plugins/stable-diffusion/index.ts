import client from '@hendricks/client';
import logger from '@hendricks/logger';
import Plugin from '@hendricks/types/Plugin';
import { BaseInteraction, ModalSubmitInteraction } from 'discord.js';
import commands from './commands';
import advancedSelectionModal from './components/advancedSelectionModal';
import reimagine from './components/reimagine';

export default {
	id: 'stable-diffusion',
	commands,
	start() {
		client.on('interactionCreate', async (...args: any[]) => {
			const interaction = args[0] as BaseInteraction;

			if (interaction.isModalSubmit()) {
				const modalInteraction = interaction as ModalSubmitInteraction;
				const modalId = modalInteraction.customId;
				if (modalId.startsWith('V+')) {
					const id = modalId.split('-')[1];
					const fields = modalInteraction.fields;
					const prompt = fields.getTextInputValue('prompt');

					logger.verbose(`modal interaction: ${id} ${prompt}`);

					let imageNumber;
					try {
						imageNumber = parseFloat(
							fields.getTextInputValue('imageNumber')
						);
					} catch (e) {
						await interaction.reply(`${e}`);
						return;
					}

					let strength;
					try {
						strength = parseFloat(
							fields.getTextInputValue('strength')
						);
					} catch (e) {
						await interaction.reply(`${e}`);
						return;
					}

					await reimagine(
						interaction,
						imageNumber,
						id,
						prompt.length == 0 ? undefined : prompt,
						strength
					);
					return;
				}
			}

			if (interaction.isButton()) {
				const message = interaction.message;
				const label = interaction.component.label;
				const buttonId = interaction.customId;
				logger.verbose(
					`button interaction: label=${label}, buttonId=${buttonId}`
				);

				if (!client.user) {
					await interaction.reply(
						`client.user is undefined. This is a bug.`
					);
					return;
				}

				if (message.client.user.id != client.user?.id) {
					return;
				}

				if (!label) {
					return;
				}

				if (label == 'Delete') {
					await interaction.message.delete();
					return;
				}

				if (label.startsWith('V+')) {
					const id = buttonId.split('-')[1];
					logger.verbose(
						`button interaction: label=${label}, id=${id}`
					);

					const modal = advancedSelectionModal(id);
					await interaction.showModal(modal);
					return;
				}

				if (label.match(/V\d/)) {
					const imageNumber = parseInt(label.substring(1));
					const id = buttonId.split('-')[1];
					logger.verbose(
						`button interaction: label=${label}, id=${id}, imageNumber=${imageNumber}`
					);
					await reimagine(
						interaction,
						imageNumber,
						id,
						undefined,
						undefined
					);
					return;
				}

				await interaction.reply(`${message.content}: ${label}`);
			}
		});
	},
} as Plugin;

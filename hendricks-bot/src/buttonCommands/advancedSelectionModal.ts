import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

export default function advancedSelectionModal(id: string) {
	const modal = new ModalBuilder()
		.setCustomId(`V+-${id}`)
		.setTitle('Variations +');
	const selectImage = new TextInputBuilder()
		.setCustomId('imageNumber')
		.setLabel('image number')
		.setRequired(true)
		.setStyle(TextInputStyle.Short);
	const prompt = new TextInputBuilder()
		.setCustomId('prompt')
		.setLabel('prompt')
		.setRequired(false)
		.setStyle(TextInputStyle.Short);
	const strength = new TextInputBuilder()
		.setCustomId('strength')
		.setLabel('strength')
		.setValue('0.8')
		.setRequired(true)
		.setStyle(TextInputStyle.Short);
	const rows = [
		new ActionRowBuilder<TextInputBuilder>().addComponents(selectImage),
		new ActionRowBuilder<TextInputBuilder>().addComponents(prompt),
		new ActionRowBuilder<TextInputBuilder>().addComponents(strength),
	];
	modal.addComponents(rows);
	return modal;
}

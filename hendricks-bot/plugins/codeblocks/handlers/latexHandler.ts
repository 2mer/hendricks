// useful resources:
// - https://github.com/mathjax/MathJax#using-mathjax-components-in-a-node-application
// - https://github.com/mathjax/MathJax-demos-node
// - https://github.com/lovell/sharp

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mathjax = require('mathjax');
import { chartEmoji } from '../emoji';
import ICodeblockHandler, {
	ICodeblockRunContext,
} from '../types/ICodeblockHandler';
import { AttachmentBuilder } from 'discord.js';
import { logger } from '..';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

class LatexHandler {
	static MathJax: any = undefined;
}

export async function generateSvg(code: string) {
	try {
		const node = await LatexHandler.MathJax!.tex2svgPromise(code, {
			display: true,
		});
		const adaptor = LatexHandler.MathJax!.startup.adaptor;

		return adaptor.innerHTML(node);
	} catch (err: any) {
		logger?.error(err);
		throw new Error('Failed to generate svg');
	}
}

export default {
	id: 'latexHandler',

	test: /^latex$/,

	async init() {
		LatexHandler.MathJax = await mathjax.init({
			loader: { load: ['input/tex', 'output/svg'] },
		});
	},

	async react(message) {
		await message.react(chartEmoji);
	},

	async run({ code, emoji, sourceMessage }: ICodeblockRunContext) {
		if (emoji === chartEmoji) {
			const svg = await generateSvg(code);

			const buffer: any = Buffer.from(svg);

			const image = await sharp(buffer)
				.resize({ height: 100 })
				.flatten({ background: '#ffffff' })
				.extend({
					top: 10,
					bottom: 20,
					left: 10,
					right: 10,
					background: '#ffffff',
				})
				.png();

			const attachment = new AttachmentBuilder(image, {
				name: 'math.jpg',
			});

			await sourceMessage!.reply({
				content: 'done',
				files: [attachment],
			});
		}
	},
} as ICodeblockHandler;

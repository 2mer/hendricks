// useful resources:
// - https://github.com/mathjax/MathJax#using-mathjax-components-in-a-node-application
// - https://github.com/mathjax/MathJax-demos-node
// - https://github.com/lovell/sharp

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mathjax = require('mathjax');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

class LatexHandler {
	static MathJax: any = undefined;
}

export async function init() {
	try {
		LatexHandler.MathJax = await mathjax.init({
			loader: { load: ['input/tex', 'output/svg'] }
		});
		return 'ok';
	} catch (err: any) {
		return { err }
	}
}

export async function generateSvg(code: string) {
	try {
		const node = await LatexHandler.MathJax!.tex2svgPromise(code, { display: true });
		const adaptor = LatexHandler.MathJax!.startup.adaptor;
		// console.log(MathJax.startup.adaptor.outerHTML(svg));
		return { svg: adaptor.innerHTML(node) };
	} catch (err: any) {
		return { err };
	}
}

export async function generateImage(code: string) {
	try {
		const svg = await generateSvg(code);
		if (svg.err) {
			return { latexError: svg.err };
		}

		const buffer: any = Buffer.from(svg.svg);

		const image = await sharp(buffer)
			.resize({ height: 100 })
			.flatten({ background: '#ffffff' })
			.extend({
				top: 10,
				bottom: 20,
				left: 10,
				right: 10,
				background: '#ffffff'
			}).png();
		return { image };
	} catch (err: any) {
		return { imageError: err };
	}
}

export default function parseCodeblock(
	content: string
): { lang: string; code: string } | null {
	// split into lines
	const lines = content.split(/\n\r?/);
	if (lines.length < 2) return null;

	// content must start and end with '```'
	const firstLine = lines[0];
	const lastLine = lines[lines.length - 1];
	if (!firstLine.startsWith('```') || lastLine != '```') return null;

	// extract and return
	return {
		lang: firstLine.substring(3),
		code: lines.slice(1, lines.length - 1).join('\n'),
	};
}

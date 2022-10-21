
export function extractCode(
	content: string
): { lang: string; code: string } | undefined {
	// split into lines
	const lines = content.split(/\n\r?/);
	if (lines.length < 2) return undefined;

	// content must start and end with '```'
	const firstLine = lines[0];
	const lastLine = lines[lines.length - 1];
	if (!firstLine.startsWith('```') || lastLine != '```') return undefined;

	// extract and return
	return {
		lang: firstLine.substring(3),
		code: lines.slice(1, lines.length - 1).join('\n'),
	};
}
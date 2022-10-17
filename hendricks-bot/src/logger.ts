import { createLogger, format, transports } from 'winston';
const { LOG_LEVEL = 'error' } = process.env;

const logger = createLogger({
	level: LOG_LEVEL,
	transports: [
		new transports.Console({
			format: format.combine(
				format.timestamp({
					format: 'HH-MM:ss YYYY-MM-DD',
				}),
				format.prettyPrint(),
				format.colorize(),
				format.printf((info) => {
					return `[${info.timestamp} ${info.level}]: ${info.message}`;
				})
			),
		}),
	],
});

export default logger;

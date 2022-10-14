import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import commands from "./commands/commands";

config();
const token = process.env['TOKEN'] as string;
const guildId = process.env['GUILD_ID'] as string;
const clientId = process.env['CLIENT_ID'] as string;

const rest = new REST({ version: '10' }).setToken(token);

// add guild only commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
	.then((data) => console.log(`Successfully registered ${(data as any[]).length} guild commands.`))
	.catch(console.error);

// add global commands
const applicationCommands = commands.map(command => command.slash.toJSON())
rest.put(Routes.applicationCommands(clientId), { body: applicationCommands })
	.then((data) => console.log(`Successfully registered ${(data as any[]).length} application commands.`))
	.catch(console.error);

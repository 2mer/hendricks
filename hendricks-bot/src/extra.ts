import { AudioPlayer } from "@discordjs/voice";

export interface ClientExtras {
	player?: AudioPlayer,
	queue: any[],
};

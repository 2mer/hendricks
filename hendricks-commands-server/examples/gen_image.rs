use dotenv::dotenv;
use hendricks_commands_server::requests::generation::Generation;
use std::env;

fn main() {
	// load environment
	dotenv().ok();
	let sd_dir = env::var("SD_DIR").unwrap();
	let out_dir = env::var("OUT_DIR").unwrap();

	// create the command
	let prompt = "a photo of an onion on the side of the road";
	let gen = Generation {
		prompt: prompt.to_string(),
		plms: true,
		n_samples: None,
		seed: Some(0),
		skip_save: true,
		ddim_steps: None,
		n_iter: None,
		h: None,
		w: None,
		c: None,
		f: None,
	};
	let mut command = gen.generate_command(&sd_dir, &out_dir);

	// execute
	println!("{}", command.status().unwrap());
}

use std::{path::Path, process::Command};

use rocket::serde::Deserialize;

use crate::utils::list_dir_items;

fn default_plms() -> bool {
	false
}

#[derive(Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Regeneration {
	pub prompt: String,
	pub from_id: i32,
	pub image_number: usize,
	pub strength: f32,
	pub seed: Option<u32>,
	#[serde(default = "default_plms")]
	pub plms: bool,
}

impl Regeneration {
	pub fn generate_command(&self, sd_root_dir: &str, source_dir: &Path, out_dir: &str) -> Command {
		log::debug!(
			"Regeneration::generate_command: from_id={}, image_number={}, source_dir={:?}",
			self.from_id,
			self.image_number,
			source_dir.to_str()
		);

		// get the image to regenerate
		let (files, _) = list_dir_items(&source_dir);
		let image = files.iter().nth(self.image_number).unwrap().as_str();
		let source_image = source_dir.join(image);

		// base command and location
		let mut command = Command::new("python");
		command.arg("scripts/img2img.py");
		command.current_dir(sd_root_dir);

		// specify image
		command.arg("--prompt");
		command.arg(format!("\"{}\"", self.prompt));

		// specify image
		command.arg("--init-img");
		command.arg(source_image.to_str().unwrap());

		// output directory
		command.arg("--outdir");
		command.arg(out_dir);

		// save
		command.arg("--strength");
		command.arg(format!("{}", self.strength));

		// seed
		if let Some(seed) = self.seed {
			command.arg("--seed");
			command.arg(seed.to_string());
		}

		// plms
		if self.plms {
			command.arg("--plms");
		}

		return command;
	}
}

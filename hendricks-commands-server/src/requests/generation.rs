use std::process::Command;

use rocket::serde::Deserialize;

fn default_ddim_steps() -> Option<usize> {
	None
}

fn default_plms() -> bool {
	true
}

fn default_n_iter() -> Option<usize> {
	None
}

fn default_h() -> Option<usize> {
	None
}

fn default_w() -> Option<usize> {
	None
}

fn default_c() -> Option<usize> {
	None
}

fn default_f() -> Option<usize> {
	None
}

fn default_n_samples() -> Option<usize> {
	None
}

fn default_seed() -> Option<u32> {
	None
}

fn default_skip_save() -> bool {
	false
}

#[derive(Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Generation {
	pub prompt: String,
	#[serde(default = "default_ddim_steps")]
	pub ddim_steps: Option<usize>,

	#[serde(default = "default_plms")]
	pub plms: bool,
	#[serde(default = "default_n_iter")]
	pub n_iter: Option<usize>,
	#[serde(default = "default_h")]
	pub h: Option<usize>,
	#[serde(default = "default_w")]
	pub w: Option<usize>,
	#[serde(default = "default_c")]
	pub c: Option<usize>,
	#[serde(default = "default_f")]
	pub f: Option<usize>,
	#[serde(default = "default_n_samples")]
	pub n_samples: Option<usize>,

	#[serde(default = "default_seed")]
	pub seed: Option<u32>,
	#[serde(default = "default_skip_save")]
	pub skip_save: bool,
}

impl Generation {
	pub fn generate_command(&self, sd_root_dir: &str, out_dir: &str) -> Command {
		// base command and location
		let mut command = Command::new("python");
		command.arg("scripts/txt2img.py");
		command.current_dir(sd_root_dir);

		// output directory
		command.arg("--outdir");
		command.arg(out_dir);

		// save
		if self.skip_save {
			command.arg("--skip_save");
		}

		// prompt
		command.arg("--prompt");
		command.arg(format!("\"{}\"", self.prompt));

		// ddim_steps
		if let Some(n) = self.ddim_steps {
			command.arg("--ddim_steps");
			command.arg(n.to_string());
		}

		// plms
		if self.plms {
			command.arg("--plms");
		}

		// default_n_iter
		if let Some(n) = self.n_iter {
			command.arg("--n_iter");
			command.arg(n.to_string());
		}
		// default_h
		if let Some(n) = self.h {
			command.arg("--H");
			command.arg(n.to_string());
		}
		// default_w
		if let Some(n) = self.w {
			command.arg("--W");
			command.arg(n.to_string());
		}
		// default_c
		if let Some(n) = self.c {
			command.arg("--C");
			command.arg(n.to_string());
		}
		// default_f
		if let Some(n) = self.f {
			command.arg("--F");
			command.arg(n.to_string());
		}

		// n_samples
		if let Some(n) = self.n_samples {
			command.arg("--n_samples");
			command.arg(n.to_string());
		}

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

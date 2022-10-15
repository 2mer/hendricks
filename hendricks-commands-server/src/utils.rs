use std::{
	collections::HashSet,
	path::{Path, PathBuf},
};

use rocket::serde::{Deserialize, Deserializer};

/// Returns (files, directories) in a given directory.
pub fn list_dir_items<P: AsRef<std::path::Path>>(dir: P) -> (HashSet<String>, HashSet<String>) {
	let path = dir.as_ref();

	log::debug!("list_dir_items: {}", path.to_str().unwrap());

	let mut files = HashSet::new();
	let mut dirs = HashSet::new();
	for f in std::fs::read_dir(path).unwrap() {
		let f = f.unwrap();
		let name = f.file_name().to_str().unwrap().to_owned();

		if f.file_type().unwrap().is_file() {
			files.insert(name);
		} else if f.file_type().unwrap().is_dir() {
			dirs.insert(name);
		}
	}
	(files, dirs)
}

pub fn pick_log_file() -> PathBuf {
	let now = chrono::offset::Local::now();
	let name = now.format("%Y-%m-%d_%H-%M-%S").to_string();
	Path::new("logs").join(name)
}

/// Deserializes a string while removing all new line characters.
pub fn deserialize_no_newline<'de, D>(deserializer: D) -> Result<String, D::Error>
where
	D: Deserializer<'de>,
{
	let to_line = |s: String| s.lines().into_iter().collect::<Vec<_>>().join("");
	String::deserialize(deserializer).map(to_line)
}

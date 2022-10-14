pub mod generation;

pub enum Request {
	Generation(generation::Generation),
}

impl From<generation::Generation> for Request {
	fn from(generation: generation::Generation) -> Self {
		Self::Generation(generation)
	}
}

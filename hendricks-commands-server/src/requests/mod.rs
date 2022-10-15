pub mod generation;
pub mod regeneration;

use generation::Generation;
use regeneration::Regeneration;

pub enum Request {
	Gen(Generation),
	Re(Regeneration),
}

impl From<Generation> for Request {
	fn from(g: Generation) -> Self {
		Self::Gen(g)
	}
}

impl From<Regeneration> for Request {
	fn from(r: Regeneration) -> Self {
		Self::Re(r)
	}
}

use dotenv::dotenv;
use hendricks_commands_server::{
	requests::{generation::Generation, regeneration::Regeneration},
	utils::pick_log_file,
	worker::{self, get_image_path, listen, start_worker_thread, TaskStatus},
};
use rocket::{
	fs::NamedFile,
	response::status::NotFound,
	response::stream::{Event, EventStream},
	serde::json::Json,
	{get, launch, post, routes},
};
use simplelog::WriteLogger;

/// A POST route for submitting an image generation request.
/// The input is a json serialized [task::Generation] object and the output is the
/// id of the request.
#[post("/gen", data = "<req>")]
async fn gen(req: Json<Generation>) -> String {
	log::info!("/gen: prompt={}", req.prompt);

	let (id, number_in_queue) = worker::request(req.0);

	log::info!("/gen: id={id}, number_in_queue={number_in_queue}");

	format!("{} {}", id, number_in_queue)
}

/// A POST route for submitting an image regeneration request.
/// The input is a json serialized [task::Regeneration] object and the output is
/// the id of the request.
#[post("/regen", data = "<req>")]
async fn regen(req: Json<Regeneration>) -> String {
	log::info!("/regen: prompt={}", req.prompt);

	let (id, number_in_queue) = worker::request(req.0);

	log::info!("/regen: id={id}, number_in_queue={number_in_queue}");

	format!("{} {}", id, number_in_queue)
}

/// A GET route for receiving updates on a request.
/// Once an ID has been received from [gen], it can be sent to [events] to receive
/// updates on the progress of the request.
#[get("/events/<id>")]
async fn events(id: i32) -> EventStream![] {
	// let status = get_status(name).await;
	log::info!("/events: id={id}");

	let status = if let Some(mut rx) = listen(id) {
		match rx.recv().await.unwrap() {
			TaskStatus::Pending => "pending".to_string(),
			TaskStatus::Complete { seconds } => format!("complete {seconds}"),
		}
	} else {
		"id not found".to_string()
	};

	log::info!("/events: id={id}, status={status}");

	EventStream! {
		yield Event::data(status);
	}
}

/// A GET route for receiving an image.
/// Once a 'complete' event has been received from [events], the user can request
/// the completed image from this route.
#[get("/image/<id>")]
async fn image(id: i32) -> Result<NamedFile, NotFound<String>> {
	log::info!("/image: id={id}");
	let path = get_image_path(id);
	log::info!("retuning image: id={}, path={:?}", id, &path);
	NamedFile::open(path)
		.await
		.map_err(|e| NotFound(e.to_string()))
}

/// A GET route for all the queued task ids.
#[get("/queued")]
async fn queued() -> Json<Vec<i32>> {
	worker::queued().into()
}

#[launch]
fn rocket() -> _ {
	// load environment
	dotenv().ok();

	// set up logging
	WriteLogger::init(
		log::LevelFilter::Debug,
		simplelog::Config::default(),
		std::fs::File::create(pick_log_file()).unwrap(),
	)
	.unwrap();

	let _handle = start_worker_thread();

	// run the server
	rocket::build().mount("/", routes![gen, image, events, queued, regen])
}

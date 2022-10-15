use std::{
	collections::{HashMap, VecDeque},
	env,
	path::{Path, PathBuf},
	process::Command,
	sync::{mpsc, Mutex},
	thread::{spawn, JoinHandle},
	time::Instant,
};

use rocket::tokio::sync::mpsc::{unbounded_channel, UnboundedReceiver, UnboundedSender};

use lazy_static::lazy_static;

use crate::{requests::Request, utils::list_dir_items};

lazy_static! {
	static ref WORKER: Mutex<Worker> = Mutex::new(Worker::new());
	static ref SIGNAL_TX_RX: (Mutex<mpsc::Sender<()>>, Mutex<mpsc::Receiver<()>>) = {
		let (tx, rx) = mpsc::channel::<()>();
		(Mutex::new(tx), Mutex::new(rx))
	};
}

#[derive(Debug, Copy, Clone, PartialEq)]
pub enum TaskStatus {
	Pending,
	Complete { seconds: f32 },
}

struct Task {
	req: Request,
	id: i32,
	status: TaskStatus,
	// any status update will be sent to these listeners
	listeners: Vec<UnboundedSender<TaskStatus>>,
	outputs: Vec<String>,
}

impl Task {
	pub fn new(req: Request, id: i32) -> Self {
		Self {
			req,
			id,
			status: TaskStatus::Pending,
			listeners: Vec::new(),
			outputs: Vec::new(),
		}
	}
}

pub fn start_worker_thread() -> JoinHandle<()> {
	spawn(worker_loop)
}

fn worker_loop() {
	loop {
		// if the queue is empty, wait for the wake up signal
		let queue_empty = {
			let worker = WORKER.lock().unwrap();
			worker.queue.is_empty()
		};
		if queue_empty {
			let rx = SIGNAL_TX_RX.1.lock().unwrap();
			rx.recv().unwrap();
			continue;
		}

		// get the id of the next task in the queue and generate its command
		let (id, mut command) = {
			let mut worker = WORKER.lock().unwrap();

			// generate the command
			let id = *worker.queue.back().unwrap();
			let req = &worker.id_to_task[&id].req;
			let (dir_name, command) = generate_command(req, &worker.id_to_task);

			// add the output directory to the tasks's outputs
			worker
				.id_to_task
				.get_mut(&id)
				.unwrap()
				.outputs
				.push(dir_name);

			(id, command)
		};

		log::debug!(
			"running command: {} {}",
			command.get_program().to_str().unwrap(),
			command
				.get_args()
				.map(|a| a.to_str().unwrap())
				.collect::<Vec<_>>()
				.join(" ")
		);

		// run the command
		let start = Instant::now();
		command.status().unwrap();
		let end = Instant::now();
		let seconds = (end - start).as_secs_f32();

		// mark the task as complete
		{
			let mut worker = WORKER.lock().unwrap();

			if let Some(task) = worker.id_to_task.get_mut(&id) {
				// mark the task as complete
				task.status = TaskStatus::Complete { seconds };

				// send all signals
				for tx in &mut task.listeners {
					tx.send(task.status).unwrap();
				}
			}

			worker.queue.pop_back().unwrap();
		}
		log::info!("worker, completed task id={}", id);
	}
}

pub struct Worker {
	id_to_task: HashMap<i32, Task>,
	queue: VecDeque<i32>,
}

impl Worker {
	pub fn new() -> Self {
		Self {
			id_to_task: HashMap::new(),
			queue: VecDeque::new(),
		}
	}
}

/// Submits a new request to the worker. Returns the id and the number of the request
/// in the queue.
pub fn request(req: impl Into<Request>) -> (i32, usize) {
	let (id, num_in_queue) = {
		// lock the worker
		let mut worker = WORKER.lock().unwrap();

		// assign an id and submit
		let id = worker.id_to_task.len() as i32;
		worker.id_to_task.insert(id, Task::new(req.into(), id));
		worker.queue.push_front(id);
		let num_in_queue = worker.queue.len();

		(id, num_in_queue)
	};

	send_signal();

	log::info!("worker, new task, id={id}, num_in_queue={num_in_queue}");

	(id, num_in_queue)
}

pub fn listen(id: i32) -> Option<UnboundedReceiver<TaskStatus>> {
	// lock the worker
	let mut worker = WORKER.lock().unwrap();

	// create the channel
	let (tx, rx) = unbounded_channel();

	// get the task
	if let Some(task) = worker.id_to_task.get_mut(&id) {
		// if the task is already complete, send a complete signal
		// else, add a listener to the task and let the task send its complete signal
		// when its ready
		if let TaskStatus::Complete { .. } = task.status {
			log::debug!("worker: listen: complete, id={}", task.id);
			tx.send(task.status).unwrap();
		} else {
			log::debug!("worker: listen: sent receiver, id={}", task.id);
			task.listeners.push(tx);
		}

		Some(rx)
	} else {
		None
	}
}

pub fn get_image_path(id: i32) -> PathBuf {
	// load env
	lazy_static! {
		static ref OUT_DIR: String = env::var("OUT_DIR").unwrap();
	}

	// get the output directory
	let task_out_dir = {
		let worker = WORKER.lock().unwrap();
		worker.id_to_task[&id].outputs[0].clone()
	};

	// define the path
	let dir = Path::new(OUT_DIR.as_str()).join(&task_out_dir);

	// find the file
	let (files, _) = list_dir_items(&dir);

	// get the file
	let file = files.into_iter().next().unwrap();

	// get a path to the file
	dir.join(&file)
}

pub fn queued() -> Vec<i32> {
	let worker = WORKER.lock().unwrap();
	worker.queue.iter().cloned().collect()
}

/// Returns the directory of the command's output and the command itself.
fn generate_command(req: &Request, id_to_task: &HashMap<i32, Task>) -> (String, Command) {
	// load env
	lazy_static! {
		static ref OUT_DIR: String = env::var("OUT_DIR").unwrap();
		static ref SD_DIR: String = env::var("SD_DIR").unwrap();
	}

	// find an appropriate directory name
	let (_, dirs) = list_dir_items(OUT_DIR.as_str());
	let mut dir_name = String::new();
	let max = 1000000;
	for i in 0..max {
		dir_name = format!("{i}");
		if !dirs.contains(&dir_name) {
			break;
		}
	}

	// create the full path leading to the directory
	let target_dir = Path::new(OUT_DIR.as_str()).join(&dir_name);
	std::fs::create_dir_all(&target_dir).unwrap();

	let command = match &req {
		Request::Gen(gen) => gen.generate_command(SD_DIR.as_str(), target_dir.to_str().unwrap()),
		Request::Re(re) => {
			let source_dir = id_to_task.get(&re.from_id).unwrap().outputs[0].as_str();
			let source_dir = Path::new(OUT_DIR.as_str())
				.join(&source_dir)
				.join("samples");

			re.generate_command(SD_DIR.as_str(), &source_dir, target_dir.to_str().unwrap())
		}
	};

	(dir_name, command)
}

fn send_signal() {
	let tx = SIGNAL_TX_RX.0.lock().unwrap();
	tx.send(()).unwrap();
}

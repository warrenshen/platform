from typing import Callable

def handle_async_tasks(session_maker: Callable) -> None:
	# The api-server submits a "request"
	# The async-server reads the most recent request from the queue, executes one step of it,
	# saves its current state back to the DB, then continues on

	# Pull N requests in queue
	# Execute them in parallel
	# Write the result back to the DB
	# Run the next sequence of the function
	pass
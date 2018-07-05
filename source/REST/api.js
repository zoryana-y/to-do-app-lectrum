import { TOKEN, MAIN_URL} from './config';

export const api = {

	async createTask(newTaskMessage) {
		const response = await fetch(MAIN_URL, {
			method: 'POST',
			headers: {
				'Authorization': TOKEN,
				'Content-Type': 'application/json'
			},
			body:  JSON.stringify({ 'message': newTaskMessage }) 
		});

		if(response.status !== 200) {
			throw new Error('Task was not created');
		}

		const { data: task } = await response.json();
		return task;
	},

	async fetchTasks() {

		const response = await fetch(MAIN_URL, {
			method: 'GET',
			headers: {
				'Authorization': TOKEN
			}
		});

		if(response.status !== 200) {
			throw new Error('Tasks was not loaded');
		}

		const { data: tasks } = await response.json();
		return tasks;
	},

	async updateTask(task) {
		const response = await fetch(MAIN_URL, {
			method: 'PUT',
			headers: {
				'Authorization': TOKEN,
				'Content-Type': 'application/json'
			},
		 	body: JSON.stringify([task]),

		});

		const { data: [updatedTask] } = await response.json();

		if(response.status !== 200 ) {
                throw new Error('Task was not updated');
         }

		return updatedTask;
	},

	async removeTask(id) {
		const response = await fetch(`${MAIN_URL}/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': TOKEN
			}

		});

		if(response.status !== 204 ) {
            throw new Error('Task was not removed');
        }
	},

	async completeAllTasks(tasks) {
        let results = [];

        for (let promise of tasks) {

            results.push(fetch(MAIN_URL, {
							method: 'PUT',
							headers: {
								'Authorization': TOKEN,
								'Content-Type': 'application/json'
							},
						 	body: JSON.stringify([promise])
						})
				)}	


		const response = await Promise.all(results);

		const responseStatus = response.every(promise => promise.status === 200);

		  if(!responseStatus) {
                throw new Error('Complete all tasks fails');
            }


	}	
}
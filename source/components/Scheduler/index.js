// Core
import React, { Component } from 'react';
import FlipMove from 'react-flip-move'

// Components
import Task from 'components/Task'
import Spinner from 'components/Spinner'

// Instruments
import Styles from './styles.m.css';
import Checkbox from 'theme/assets/Checkbox';
import { api } from '../../REST';
import { sortTasksByGroup } from '../../Instruments';

export default class Scheduler extends Component {
  state = {
    newTaskMessage: '',
    tasksFilter: '',
    isTasksFetching: false,
    tasks: [],
    inputMaxLength: 50
  }


  componentDidMount() {
    this._fetchTasksAsync();
  }

  _getAllCompleted = () => this.state.tasks.every((task) => task.completed);

  _setTasksFetchingState = (isTasksFetching) => {
    this.setState({
      isTasksFetching
    });
  };

  _fetchTasksAsync = async() => {
    try {
      this._setTasksFetchingState(true);

      const tasks = await api.fetchTasks();

      this.setState({
        tasks: sortTasksByGroup(tasks)
      })
    } catch ( {message} ) {
      console.log(message);
    } finally {
      this._setTasksFetchingState(false);
    }
  }

  _createTaskAsync = async(e) => {
    try {
      e.preventDefault();
      const {newTaskMessage} = this.state;

      if (!newTaskMessage) {
        return null
      }

      this._setTasksFetchingState(true);

      const task = await api.createTask(newTaskMessage);

      this.setState((prevState) => ({
        tasks: sortTasksByGroup([task, ...prevState.tasks]),
        newTaskMessage: ''
      }));

    } catch ( {message} ) {
      console.log(message);
    } finally {
      this._setTasksFetchingState(false);
    }
  }

  _updateTaskAsync = async(toUpdateTask) => {
    try {
      this._setTasksFetchingState(true);
	  const { tasks } = this.state;

      const updateTask = await api.updateTask(toUpdateTask);
      const index = tasks.findIndex(task => task.id === toUpdateTask.id);
      const newTasks = [... tasks.slice(0, index), updateTask, ...tasks.slice(index + 1, tasks.length)];
      const sortedTasks = sortTasksByGroup(newTasks);

      this.setState({
          tasks: sortedTasks
      });

    } catch ( {message} ) {
      console.log(message)
    } finally {
      this._setTasksFetchingState(false);
    }
  }

  _removeTaskAsync = async(id) => {
    try {
      this._setTasksFetchingState(true);
      await api.removeTask(id);
      const {tasks} = this.state;
      const updatedTaskList = tasks.filter((task) => task.id !== id);
      this.setState({
        tasks: updatedTaskList
      })
    } catch ( {message} ) {
      console.log(message);
    } finally {
      this._setTasksFetchingState(false);
    }
  }

  _updateNewTaskMessage = (e) => {
    const {value: newTaskMessage} = e.target;
    this.setState({
      newTaskMessage
    });
  }

  _completeAllTasksAsync = async() => {
    try {
      if (this._getAllCompleted()) {
        return null
      }

      this._setTasksFetchingState(true);

      const {tasks} = this.state;

      tasks.forEach(task => {
        if (task.completed !== true) {
          task.completed = true;
        }
      });
      
      this.setState({tasks})
      await api.completeAllTasks(tasks);

    } catch ( {message} ) {
      console.log(message);
    } finally {
      this._setTasksFetchingState(false);
    }

  }

  _updateTasksFilter = (e) => {
    const {value: tasksFilter} = e.target;

    this.setState({
      tasksFilter: tasksFilter.toLowerCase()
    });

    this._searchForTask();
  }

  _searchForTask = () => {
    const {tasks, tasksFilter} = this.state;

    if (tasksFilter) {
      const searchFilter = tasks.filter((task) => task.message.toLowerCase().includes(tasksFilter));
      return searchFilter
    }

    return null
  }


  render() {
    const {isTasksFetching, tasks, newTaskMessage, tasksFilter, inputMaxLength} = this.state;

    const checkBox = tasks.length ? this._getAllCompleted() : false;
    const searchedTask = this._searchForTask();
    const myTasks = searchedTask !== null ? searchedTask : tasks;


    const tasksList = myTasks.map((taskItem) => (

      <Task {...taskItem}
      key = { taskItem.id }
      _updateTaskAsync = { this._updateTaskAsync }
      _removeTaskAsync = { this._removeTaskAsync } />

    ))

    return (
      <section className = { Styles.scheduler }>
            	<main>
            	    <Spinner isSpinning = { isTasksFetching } />
            		<header>
            			<h1 className = "test" >Планировщик задач</h1>
            			<input
					      onChange = { this._updateTasksFilter }
					      placeholder="Поиск"
					      type="search"
					      value= { tasksFilter }
					      />
            		</header>
            		<section>
            			<form onSubmit = {this._createTaskAsync}>
				          <input
						      className= { Styles.createTask }
						      maxLength= { inputMaxLength }
						      placeholder="Описaние моей новой задачи"
						      type="text"
						      onChange = { this._updateNewTaskMessage }
						      value = { newTaskMessage }
						      />
				          <button>
				            Добавить задачу
				          </button>
				        </form>
            		<div className="overlay">
	            		<ul> 
	            			<FlipMove duration={400}>           
	            			{ tasksList }
	            			</FlipMove>
	            		</ul>
            		</div>
            		</section>  
            		<footer>
            			    <Checkbox
						      checked={ checkBox }
						      color1="#363636"
						      color2="#fff"
						      onClick={ this._completeAllTasksAsync }
						      />
            			<span className= { Styles.completeAllTasks }>Все задачи выполнены</span>
            		</footer>         
            	</main>
            </section>
    );
  }
}

// Core
import React, { Component } from 'react';
import cx from 'classnames';
import { string, func, bool } from 'prop-types';


// Instruments
import Styles from './styles.m.css';
import Checkbox from 'theme/assets/Checkbox';
import Remove from 'theme/assets/Remove';
import Star from 'theme/assets/Star';
import Edit from 'theme/assets/Edit';


export default class Task extends Component {

    static propTypes = {
        id: string.isRequired,
        completed: bool.isRequired,
        favorite: bool.isRequired,
        message: string.isRequired
    } 

  state = {
    isTaskEditing: false,
    newMessage: this.props.message,
    inputMaxLength: 50
  }

  _getTaskShape = ({id = this.props.id, completed = this.props.completed, favorite = this.props.favorite, message = this.props.message, }) => ({
    id,
    completed,
    favorite,
    message,
  });

  taskInput = React.createRef();


  _toggleTaskCompletedState = () => {
    const {_updateTaskAsync, completed} = this.props;

    const updatedComletedState = this._getTaskShape({
      completed: !completed
    })

    _updateTaskAsync(updatedComletedState);

  }

  _toggleTaskFavoriteState = () => {
    const {_updateTaskAsync, favorite} = this.props;

    const updatedFavoriteState = this._getTaskShape({
      favorite: !favorite
    })

    _updateTaskAsync(updatedFavoriteState)
  }

  _setTaskEditingState = (isTaskEditing) => {
    this.setState({
      isTaskEditing
    },
      () => isTaskEditing ? this.taskInput.current.focus() : null
    );
  }

  _updateNewTaskMessage = (e) => {
    const { value: newMessage } = e.target

    this.setState({
      newMessage: newMessage
    })
  }

  _updateTask = () => {
    const { _updateTaskAsync, message } = this.props;
    const { newMessage } = this.state;

    if ( message === newMessage ) {
      this._setTaskEditingState(false);
      return null
    }

    const updateMsg = this._getTaskShape({
      message: newMessage
    })

    _updateTaskAsync(updateMsg);
    this._setTaskEditingState(false);
  }

  _updateTaskMessageOnClick = () => {
    if (this.state.isTaskEditing) {
      this._updateTask();

      return null
    }

    this._setTaskEditingState(true);
  }

  _updateTaskMessageOnKeyDown = (e) => {
    const {newMessage} = this.state;

    if (!newMessage) {
      return null
    }

    if (e.key === 'Enter') {
      this._updateTask();
    } else if (e.key === 'Escape') {
      this._cancelUpdatingTaskMessage()
    }
  }

  _cancelUpdatingTaskMessage = () => {
    this._setTaskEditingState(false);
    this.setState({
      newMessage: this.props.message
    })
  }

  _removeTask = () => {
    const { _removeTaskAsync, id } = this.props;

    _removeTaskAsync(id);
  }

  render() {
    const {id, favorite, message, completed, created, modified} = this.props;

    const {isTaskEditing, newMessage, inputMaxLength} = this.state;

    const disabled = isTaskEditing ? false : true;

    const modifiedMsg = isTaskEditing ? newMessage : message;

    const completedStatus = cx({
      [Styles.task]: true,
      [Styles.completed]: completed,
    });

    return (
        <li className = { completedStatus }>
                <div className = { Styles.content }>
                    <Checkbox
                      inlineBlock
                      color1="#3B8EF3"
                      color2="#FFF"
                      checked = { completed }
                      className = { Styles.toggleTaskCompletedState }
                      onClick = { this._toggleTaskCompletedState }
                      />
                    <input
                      ref = { this.taskInput }
                      maxLength= { inputMaxLength }
                      value = { modifiedMsg }
                      type = 'text'
                      disabled = { disabled }
                      onChange = { this._updateNewTaskMessage }
                      onKeyDown = { this._updateTaskMessageOnKeyDown }
                      />
                </div>
                <div className = { Styles.actions}>
                    <Star
                      inlineBlock
                      color1="#3B8EF3"
                      color2="#000"
                      checked = { favorite }
                      className = { Styles.toggleTaskFavoriteState }
                      onClick = {this._toggleTaskFavoriteState} />
                    <Edit
                      checked={ isTaskEditing }
                      inlineBlock
                      color1="#3B8EF3"
                      color2="#000"
                      className = { Styles.updateTaskMessageOnClick }
                      onClick = {this._updateTaskMessageOnClick }/>
                    <Remove
                      className = { Styles.removeTask }
                      color1="#3B8EF3"
                      color2="#000"
                      inlineBlock
                      onClick = { this._removeTask } />
                </div>
            </li>
    )
  }
}

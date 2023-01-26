import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { API, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import './App.css';
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from './graphql/mutations';
import { listTodos } from './graphql/queries';
import { orderObjByDate } from './helper';
import Logo from './logo.svg';
import { TodoList } from './conponents/TodoList./TodoList';

const initialFormState = { name: '', description: '' };

function App({ signOut }) {
  // const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  console.log(todos);

  useEffect(() => {
    fetchTodo();
  }, []);

  async function fetchTodo() {
    try {
      const apiData = await API.graphql({
        query: listTodos,
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      });
      const todosFromAPI = apiData.data.listTodos.items;
      await Promise.all(
        todosFromAPI.map(async (note) => {
          if (note.image) {
            const image = await Storage.get(note.image);
            note.image = image;
          }
          return note;
        })
      );
      setTodos(orderObjByDate('createdAt', apiData.data.listTodos.items));
    } catch (err) {
      console.error(`Something was wrong: ${err.message}`);
    }
  }

  async function createTodo() {
    try {
      if (!formData.name || !formData.description) return;
      await API.graphql({
        query: createTodoMutation,
        variables: { input: formData },
        authMode: 'AMAZON_COGNITO_USER_POOLS',
      });
      if (formData.image) {
        const image = await Storage.get(formData.image);
        formData.image = image;
      }
      setTodos(orderObjByDate('createdAt', [...todos, formData]));
      setFormData(initialFormState);
      document.querySelector('[type="file"]').value = '';
    } catch (err) {
      console.error(`Something was wrong: ${err.message}`);
    }
  }

  // async function deleteTodo({ id }) {
  //   try {
  //     const newTodosArray = todos.filter((note) => note.id !== id);
  //     setTodos(orderObjByDate('createdAt', newTodosArray));
  //     await API.graphql({
  //       query: deleteTodoMutation,
  //       variables: { input: { id } },
  //       authMode: 'AMAZON_COGNITO_USER_POOLS',
  //     });
  //   } catch (err) {
  //     console.error(`Something was wrong: ${err.message}`);
  //   }
  // }

  async function onChange(e) {
    try {
      if (!e.target.files[0]) return;
      const file = e.target.files[0];
      setFormData({ ...formData, image: file.name });
      await Storage.put(file.name, file);
      fetchTodo();
    } catch (err) {
      console.error(`Something was wrong: ${err.message}`);
    }
  }

  return (
    <div className='App App-header'>
      <img src={Logo} alt='react logo' className='App-logo' />
      <h1 className=''>Full-Stack Todo App</h1>
      <fieldset className='fieldset'>
        <input
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder='Task title'
          value={formData.name}
        />
        <input
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder='Task description'
          value={formData.description}
        />
        <input type='file' id='file-input' onChange={onChange} />
        <button onClick={createTodo}>Create Todo</button>
      </fieldset>
      <div
        style={{
          marginBottom: 30,
          marginTop: 40,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          justifyContent: 'center',
        }}
      >
        <TodoList todos={todos}/>
        {/* {todos?.map((todo) => (
          <div key={todo.id || todo.name} className='todo-card'>
            <div style={{ textAlign: 'center' }}>
              <h2>{todo.name}</h2>
              <p>{todo.description}</p>
              <p>
                Created at{' '}
                {todo.createdAt
                  ? new Date(todo.createdAt).toLocaleDateString()
                  : new Date().toLocaleDateString()}{' '}
                {todo.createdAt
                  ? new Date(todo.createdAt).toLocaleTimeString()
                  : new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className='flex-col'>
              {todo.image && (
                <img src={todo.image} className='todo-img' alt={todo.name} />
              )}
              <button onClick={() => deleteTodo(todo)}>Delete todo</button>
            </div>
          </div>
        ))} */}
      </div>
      <button onClick={signOut} className='sign-out-btn'>
        Sign Out
      </button>
    </div>
  );
}

export default withAuthenticator(App);

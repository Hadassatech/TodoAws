import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { API, Storage } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import './App.css';
import { listTodos } from './graphql/queries';
import { orderObjByDate } from './helper';
import Logo from './logo.svg';
import { TodoList } from './TodoList';

const initialFormState = { name: '', description: '' };

function App({ signOut }) {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

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
      </fieldset>
      <div className="div-center">
        <TodoList todos={todos} setTodos={setTodos} formData={formData} setFormData={setFormData} initialFormState={initialFormState} />
      </div>
      <button onClick={signOut} className='sign-out-btn'>
        Sign Out
      </button>
    </div>
  );
}

export default withAuthenticator(App);

import React, { useEffect, useState } from "react";
import { orderObjByDate } from '././helper';
import {
    createTodo as createTodoMutation,
    deleteTodo as deleteTodoMutation,
    updateTodo as updateTodoMutation
} from './graphql/mutations';
import '@aws-amplify/ui-react/styles.css';
import { API, Storage } from 'aws-amplify';
import './Todo.css';

export const Todo = ({ todo, todos, setTodos }) => {
    const [weather, setWeather] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editTodoData, setEditTodoData] = useState({
        name: todo.name,
        description: todo.description,
    });
    const API_KEY = '8fba545bd937478096f211823232801';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${todo.name}`);
                const data = await response.json();
                if (data && data.location.name == todo.name) {
                    setWeather(data.current.condition.text);
                } else {
                    setWeather("")
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchData();
    }, [todo, editTodoData.name])

    async function editTodo(id) {
        try {
            const updatedTodo = {
                ...todo,
                ...editTodoData
            };
            const updatedTodos = todos.map(item => {
                if (item.id === id) {
                    return updatedTodo;
                }
                return item;
            });
            setTodos(updatedTodos);
            setIsEditing(false);

            // Make the API call to update the todo here
            await API.graphql({
                query: updateTodoMutation,
                variables: { input: { id, ...editTodoData } },
                authMode: 'AMAZON_COGNITO_USER_POOLS'
            });

        } catch (err) {
            console.error(`Something was wrong: ${err.message}`);
        }
    }

    async function deleteTodo({ id }) {
        try {
            const newTodosArray = todos.filter((note) => note.id !== id);
            setTodos(orderObjByDate('createdAt', newTodosArray));
            setTodos(newTodosArray);

            await API.graphql({
                query: deleteTodoMutation,
                variables: { input: { id } },
                authMode: 'AMAZON_COGNITO_USER_POOLS',
            });
        } catch (err) {
            console.error(`Something was wrong: ${err.message}`);
        }
    }

    return (
        <div key={todo.id || todo.name} className='todo-card'>
            {isEditing ?
                <div>
                    <input
                        type="text"
                        placeholder="Edit name"
                        onChange={e => setEditTodoData({ ...editTodoData, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Edit description"
                        onChange={e => setEditTodoData({ ...editTodoData, description: e.target.value })}
                    />
                    <button onClick={() => editTodo(todo.id)}>Save</button>
                </div> :
                <>
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
                        <button onClick={() => setIsEditing(true)}>Edit todo</button>
                    </div>
                    <div>
                        {weather.length ? `weather: ${weather}` : ""}
                    </div>
                </>}
        </div>
    )
}



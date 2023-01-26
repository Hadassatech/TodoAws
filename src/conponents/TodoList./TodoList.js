import React, { useEffect, useState } from "react";
import { listTodos } from './graphql/queries';
import { orderObjByDate } from './helper';
import './App.css';
import {
    createTodo as createTodoMutation,
    deleteTodo as deleteTodoMutation,
} from './graphql/mutations';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { API, Storage } from 'aws-amplify';

export const TodoList = ({ todos }) => {
    const [todos, setTodos] = useState([]);

    async function deleteTodo({ id }) {
        try {
            const newTodosArray = todos.filter((note) => note.id !== id);
            setTodos(orderObjByDate('createdAt', newTodosArray));
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
        <>
            {
                todos?.map((todo) => (
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
                ))
            }
        </>
    )

}

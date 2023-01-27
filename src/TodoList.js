import React, { useEffect, useState } from "react";
import { orderObjByDate } from '././helper';
import {
    createTodo as createTodoMutation,
    deleteTodo as deleteTodoMutation,
} from './graphql/mutations';
import '@aws-amplify/ui-react/styles.css';
import { API, Storage } from 'aws-amplify';
import { Todo } from "./Todo";

export const TodoList = ({ todos, setTodos, formData, setFormData, initialFormState }) => {

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

    return (
        <>
            <button onClick={createTodo}>Create Todo</button>

            {todos?.map((todo) => (
                <Todo todo={todo} todos={todos} setTodos={setTodos} />
            ))
            }
        </>
    )

}

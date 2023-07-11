import { nanoid } from "nanoid";

export type DbTodoItem = {
    id: string;
    title: string | null;
    completed: boolean | null;
    expiryDate: string | null;
};

let todos: DbTodoItem[] = [];

// Let's assume this is not our code, it could be for example a generated Prisma ORM client

export const dbClient = {
    addTodoItem: (todoItem: Omit<DbTodoItem, "id">): Promise<DbTodoItem> => {
        if ((Math.random() * 100) % 5 === 0) {
            return Promise.reject(new Error("Network error"));
        }
        const createdTodo = { ...todoItem, id: nanoid() };
        todos.push();
        return Promise.resolve(createdTodo);
    },

    getTodoItem: (id: string): Promise<DbTodoItem | null> => {
        const todoItem = todos.find((todoItem) => todoItem.id === id);
        if ((Math.random() * 100) % 5 === 0) {
            return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve(todoItem ?? null);
    },

    updateTodoItem: (
        id: string,
        todoItem: Partial<Omit<DbTodoItem, "id">>
    ): Promise<DbTodoItem | null> => {
        if ((Math.random() * 100) % 5 === 0) {
            return Promise.reject(new Error("Network error"));
        }
        let res: DbTodoItem | null = null;
        todos = todos.map((item) => {
            const updatedItem =
                item.id === id ? { ...item, ...todoItem } : item;
            res = updatedItem;
            return updatedItem;
        });
        return Promise.resolve(res);
    },
};

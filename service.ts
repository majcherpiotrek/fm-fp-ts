import * as TE from "fp-ts/TaskEither";
import { AppError } from "./errors";
import { TodoItem, UpdateTodoItemRequest } from "./types";

export const service = {
    getTodoItem: (id: string): TE.TaskEither<AppError, TodoItem> => {
        return TE.left({ errorType: "unexpected", message: "Not implemented" });
    },
    createTodoItem: (todoItem: TodoItem): TE.TaskEither<AppError, TodoItem> => {
        return TE.left({ errorType: "unexpected", message: "Not implemented" });
    },
    updateTodoItem: (
        id: string,
        updateRequest: UpdateTodoItemRequest
    ): TE.TaskEither<AppError, TodoItem> => {
        return TE.left({ errorType: "unexpected", message: "Not implemented" });
    },
};

import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { AppError, createAppError } from "./errors";
import {
    CreateTodoItemRequest,
    TodoItem,
    UpdateTodoItemRequest,
} from "./types";
import { flow, pipe } from "fp-ts/function";
import { dbClient } from "./dbClient";
import { todoItemDecoder } from "./codecs";
import { decodeWith } from "./apiUtils";

const MAX_TITLE_LENGTH = 100;

const validateTodoItemLength = <T extends TodoItem | UpdateTodoItemRequest>(
    todoItem: T
): E.Either<AppError, T> => {
    if (!todoItem?.title) return E.right(todoItem);
    return todoItem.title.length <= MAX_TITLE_LENGTH
        ? E.right(todoItem)
        : E.left({
              errorType: "business",
              message: `Title must be less than ${MAX_TITLE_LENGTH} characters`,
          });
};

const validateTodoItemNotExpired = (
    todoItem: TodoItem
): E.Either<AppError, TodoItem> =>
    new Date() > todoItem.expiryDate
        ? E.left({
              errorType: "business",
              message: "Todo item has expired",
          })
        : E.right(todoItem);

export const service = {
    getTodoItem: (id: string): TE.TaskEither<AppError, TodoItem> => {
        return pipe(
            TE.tryCatch(
                () => dbClient.getTodoItem(id),
                (error) =>
                    createAppError(
                        "db",
                        `Failed to get a todo item with id ${id}`,
                        error
                    )
            ),
            TE.flatMapNullable(
                (nullableItem) => nullableItem,
                () =>
                    createAppError(
                        "business",
                        `Todo item with id ${id} not found`
                    )
            ),
            TE.flatMapEither(decodeWith(todoItemDecoder))
        );
    },

    createTodoItem: (
        todoItem: CreateTodoItemRequest
    ): TE.TaskEither<AppError, TodoItem> => {
        return pipe(
            validateTodoItemLength(todoItem),
            TE.fromEither,
            TE.flatMap((validTodoItem) =>
                TE.tryCatch(
                    () =>
                        dbClient.addTodoItem({
                            ...validTodoItem,
                            expiryDate: validTodoItem.expiryDate.toISOString(),
                        }),
                    (error) =>
                        createAppError(
                            "db",
                            "Failed to create a todo item",
                            error
                        )
                )
            ),
            TE.flatMapEither(decodeWith(todoItemDecoder))
            // In real world we code decode inside a transaction, and rollback if saved model is incorrect
            // It could indicate discrepancies between our code and the database schema
        );
    },

    updateTodoItem: (
        id: string,
        updateRequest: UpdateTodoItemRequest
    ): TE.TaskEither<AppError, TodoItem> => {
        return pipe(
            service.getTodoItem(id),
            TE.flatMapEither(validateTodoItemNotExpired),
            TE.flatMapEither(() => validateTodoItemLength(updateRequest)),
            TE.flatMap((validUpdateRequest) =>
                TE.tryCatch(
                    () => dbClient.updateTodoItem(id, validUpdateRequest),
                    (error) =>
                        createAppError(
                            "db",
                            `Failed to update a todo item with id ${id}`,
                            error
                        )
                )
            ),
            TE.flatMapEither(decodeWith(todoItemDecoder))
        );
    },
};

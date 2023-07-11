import * as D from "io-ts/Decoder";
import {
    CreateTodoItemRequest,
    TodoItem,
    UpdateTodoItemRequest,
} from "./types";
import { pipe } from "fp-ts/function";

export const dateDecoder: D.Decoder<unknown, Date> = pipe(
    D.string,
    D.parse((str) => {
        const date = new Date(str);
        return isNaN(date.getTime()) ? D.failure(str, "Date") : D.success(date);
    })
);

export const todoItemDecoder: D.Decoder<unknown, TodoItem> = D.struct({
    id: D.string,
    title: D.string,
    completed: D.boolean,
    expiryDate: dateDecoder,
});

export const createTodoItemRequestDecoder: D.Decoder<
    unknown,
    CreateTodoItemRequest
> = D.struct({
    title: D.string,
    completed: D.boolean,
    expiryDate: dateDecoder,
});

export const updateTodoItemRequestDecoder: D.Decoder<
    unknown,
    UpdateTodoItemRequest
> = D.partial({
    title: D.string,
    completed: D.boolean,
});

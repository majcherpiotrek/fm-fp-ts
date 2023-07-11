import { ApiResponse, Request } from "./types";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { authenticateRequest, authorizeRequest } from "./auth";
import { decodeWith } from "./apiUtils";
import * as D from "io-ts/Decoder";
import { service } from "./service";
import { AppError } from "./errors";

const matchAppError = (error: AppError): ApiResponse => {
    switch (error.errorType) {
        case "auth":
            return {
                status: 401,
                body: {
                    message: error.message,
                },
            };
        case "business":
        case "decoding":
            return {
                status: 400,
                body: {
                    message: error.message,
                },
            };
        case "db":
        case "network":
            return {
                status: 500,
                body: {
                    message: error.message,
                },
            };
        case "unexpected":
            return {
                status: 500,
                body: {
                    message: `Unexpected error: ${error.message}: ${error?.cause}`,
                },
            };
    }
};

export const apiRoute = {
    get: (request: Request): Promise<ApiResponse> => {
        return pipe(
            authenticateRequest(request),
            E.flatMap(authorizeRequest(["admin", "user"])),
            E.flatMap((validatedRequest) =>
                decodeWith(D.string)(validatedRequest?.query?.id)
            ),
            TE.fromEither,
            TE.flatMap((todoId) => service.getTodoItem(todoId)),
            TE.fold(
                (err) => () => Promise.resolve(matchAppError(err)),
                (todoItem) => () =>
                    Promise.resolve({ status: 200, body: todoItem })
            )
        )();
    },
    post: (request: Request): Promise<ApiResponse> => {
        return Promise.reject(new Error("Not implemented"));
    },
    put: (request: Request): Promise<ApiResponse> => {
        return Promise.reject(new Error("Not implemented"));
    },
};

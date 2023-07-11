import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import { AppError } from "./errors";
import { pipe } from "fp-ts/function";
import { Request, UserRole } from "./types";

const validateAuthHeader = (authHeader: string): E.Either<AppError, string> => {
    return pipe(
        authHeader.split("Bearer "),
        E.fromPredicate<string[], AppError>(
            ([_, token]) => {
                return token !== undefined && token !== null && token !== "";
            },
            (): AppError => ({
                errorType: "auth",
                message: "Invalid authorization header",
            })
        ),
        E.map(() => authHeader)
    );
};

export const authenticateRequest = (
    request: Request
): E.Either<AppError, Request> => {
    return pipe(
        request.headers["authorization"],
        E.fromNullable<AppError>({
            errorType: "auth",
            message: "Missing authorization header",
        }),
        E.chain(validateAuthHeader),
        E.map(() => request)
    );
};

export const authorizeRequest =
    (allowedRoles: UserRole[]) =>
    (request: Request): E.Either<AppError, Request> => {
        return pipe(
            request.user,
            E.fromNullable<AppError>({
                errorType: "auth",
                message: "Missing user in request",
            }),
            E.chain((user) =>
                pipe(
                    user.roles,
                    E.fromPredicate(
                        RA.exists((userRole) =>
                            allowedRoles.includes(userRole)
                        ),
                        (): AppError => ({
                            errorType: "auth",
                            message: "User not authorized",
                        })
                    )
                )
            ),
            E.map(() => request)
        );
    };

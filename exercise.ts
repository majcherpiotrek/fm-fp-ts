import * as O from "fp-ts/Option";
import * as RA from "fp-ts/ReadonlyArray";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/function";
import { nanoid } from "nanoid";

type UserRole = "admin" | "user";

type User = {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
};

type Session = {
    userId: string;
};

type Post = {
    id: string;
    content: string;
    userId: string;
};

// Exercise 1
const getSessionUser =
    (users: User[]) =>
    (session: Session): O.Option<User> => O.none; // TODO return associated with the session

// Exercise 2
type Request<T> = {
    session?: Session;
    payload: T;
};

const getUserFromRequest =
    <T>(users: User[]) =>
    (request: Request<T>): O.Option<User> => O.none; // TODO return associated with the request

// Exercise 3
type UnauthorizedError = {
    type: "unauthorized";
    requiredRoles: UserRole[];
    message: string;
};
type NotAuthenticatedError = {
    type: "not-authenticated";
    message: string;
};

type AppError = UnauthorizedError | NotAuthenticatedError;

const getUserFromRequestE =
    <T>(users: User[]) =>
    (request: Request<T>): E.Either<NotAuthenticatedError, User> => pipe(
        // TODO return user associated with the request and respective errors if not found
    );

// Exercise 4
const validateRequest =
    <T>(users: User[]) =>
    (allowedRoles: UserRole[]) =>
    (request: Request<T>): E.Either<AppError, Request<T>> =>
        pipe(
          // TODO return request if user has allowed roles
        );

// Exercise 5
type AddPostRequest = { content: string };

const generateId = () => nanoid(16);
const addPost =
    (users: User[], posts: Post[]) =>
    (request: Request<AddPostRequest>): E.Either<AppError, Post[]> =>
        pipe(
               // TODO apply request only if it's validated
        );


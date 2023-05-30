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
    (session: Session): O.Option<User> =>
        pipe(
            users,
            RA.findFirst((user) => user.id === session.userId)
        );

// Exercise 2
type Request<T> = {
    session?: Session;
    payload: T;
};

const getUserFromRequest =
    <T>(users: User[]) =>
    (request: Request<T>): O.Option<User> =>
        pipe(request.session, O.fromNullable, O.chain(getSessionUser(users)));

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
    (request: Request<T>): E.Either<NotAuthenticatedError, User> =>
        pipe(
            request.session,
            E.fromNullable<NotAuthenticatedError>({
                type: "not-authenticated",
                message: "Session missing",
            }),
            E.chain(
                flow(
                    getSessionUser(users),
                    E.fromOption(() => ({
                        type: "not-authenticated",
                        message: "User missing",
                    }))
                )
            )
        );

// Exercise 4
const validateRequest =
    <T>(users: User[]) =>
    (allowedRoles: UserRole[]) =>
    (request: Request<T>): E.Either<AppError, Request<T>> =>
        pipe(
            request,
            getUserFromRequestE<T>(users),
            E.chain(
                E.fromPredicate<User, AppError>(
                    (user) =>
                        allowedRoles.some((role) => user.roles.includes(role)),
                    (user) => ({
                        type: "unauthorized",
                        requiredRoles: allowedRoles,
                        message: `User ${user.name} is not authorized`,
                    })
                )
            ),
            E.map(() => request)
        );

// Exercise 5
type AddPostRequest = { content: string };

const generateId = () => nanoid(16);
const addPost =
    (users: User[], posts: Post[]) =>
    (request: Request<AddPostRequest>): E.Either<AppError, Post[]> =>
        pipe(
            request,
            validateRequest<AddPostRequest>(users)(["user"]),
            E.map((request) => [
                ...posts,
                {
                    id: generateId(),
                    content: request.payload.content,
                    userId: request.session!.userId,
                },
            ])
        );


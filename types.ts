export type Headers = Record<string, string>;
export type UserRole = "admin" | "user";

export type User = {
    roles: UserRole[];
};

export type Request = {
    headers: Headers;
    user?: User;
    body?: unknown;
    query?: Record<string, string>;
};

export type ApiResponse = {
    status: number;
    body: unknown;
};

export type TodoItem = {
    id: string;
    title: string;
    completed: boolean;
    expiryDate: Date;
};

export type CreateTodoItemRequest = Omit<TodoItem, "id">;

export type UpdateTodoItemRequest = Partial<
    Omit<TodoItem, "id" | "expiryDate">
>;

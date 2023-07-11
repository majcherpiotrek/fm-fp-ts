export type Headers = Record<string, string>;
export type UserRole = "admin" | "user";

export type User = {
    roles: UserRole[];
};

export type Request = {
    headers: Headers;
    user?: User;
    body?: unknown;
};

export type ApiResponse = {
    statusCode: number;
    body: unknown;
};

export type TodoItem = {
    id: string;
    title: string;
    completed: boolean;
    expiryDate: Date;
};

export type UpdateTodoItemRequest = Partial<
    Omit<TodoItem, "id" | "expiryDate">
>;

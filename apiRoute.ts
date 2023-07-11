import { ApiResponse, Request } from "./types";

export const apiRoute = {
    get: (request: Request): Promise<ApiResponse> => {
        throw new Error("Not implemented");
    },
    post: (request: Request): Promise<ApiResponse> => {
        throw new Error("Not implemented");
    },
    put: (request: Request): Promise<ApiResponse> => {
        throw new Error("Not implemented");
    },
};

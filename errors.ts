export type ErrorType =
    | "db"
    | "network"
    | "decoding"
    | "auth"
    | "business"
    | "unexpected";

export type AppError = {
    errorType: ErrorType;
    message: string;
    cause?: string;
};

const getUnknownErrorMessage = (error: unknown): string => {
    if (typeof error === "string") {
        return error;
    }
    if (typeof error === "object" && error !== null) {
        if ("message" in error && typeof error.message === "string") {
            return error.message;
        }
    }
    return "Unknown error";
};

const parseError = (
    errorType: ErrorType,
    message: string,
    cause?: unknown
): AppError => {
    return {
        errorType,
        message,
        cause: cause ? getUnknownErrorMessage(cause) : undefined,
    };
};

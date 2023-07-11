import * as D from "io-ts/Decoder";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { AppError } from "./errors";

export const decodeWith =
    <T>(decoder: D.Decoder<unknown, T>) =>
    (value: unknown): E.Either<AppError, T> =>
        pipe(
            decoder.decode(value),
            E.mapLeft(
                (decodingError): AppError => ({
                    errorType: "decoding",
                    message: D.draw(decodingError),
                })
            )
        );

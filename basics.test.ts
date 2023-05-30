import { flow, pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";

describe("Welcome to fp-ts", () => {
    describe("pipe & flow", () => {
        it("pipe takes a value as its first argument, and then a series of functions", () => {
            const result = pipe(
                "/foo/bar",
                (s) => s.split("/"),
                (elements) => elements.filter((elem) => elem !== ""),
                ([foo, bar]) => ({ foo, bar })
            );

            expect(result).toEqual({ foo: "foo", bar: "bar" });
        });

        it("flow is similar to pipe, but it takes a function as its first argument", () => {
            const result = flow(
                (s: string) => s.split("/"),
                (elements) => elements.filter((elem) => elem !== ""),
                (elements) =>
                    elements.reduce(
                        (acc, elem) => ({ ...acc, [elem]: elem }),
                        {} as Record<string, string>
                    )
            );

            expect(result("/foo/bar")).toEqual({ foo: "foo", bar: "bar" });
        });
    });

    describe("Option", () => {
        type Option<T> = O.Option<T>;

        it("Constructing an Option", () => {
            // fromNullable
            expect(O.fromNullable(null)).toEqual(O.none);
            expect(O.fromNullable("hello")).toEqual(O.some("hello"));

            //of === some
            expect(O.of(null)).toEqual(O.some(null)); // Watch out !!!
            expect(O.of("hello")).toEqual(O.some("hello"));

            //fromPredicate
            expect(O.fromPredicate((n: number) => n > 0)(-1)).toEqual(O.none);
            expect(O.fromPredicate((n: number) => n > 0)(1)).toEqual(O.some(1));
        });

        it("map and flatMap / chain", () => {
            const upperCaseOpt = (s: string | null) =>
                pipe(
                    O.fromNullable(s),
                    O.map((s) => s.toUpperCase())
                );

            expect(upperCaseOpt("hello")).toEqual(O.some("HELLO"));
            expect(upperCaseOpt(null)).toEqual(O.none);
            expect(upperCaseOpt("")).toEqual(O.some(""));

            // What if we want to chain multiple operations that yield an Option?
            type NonEmptyString = string & { _tag: "NonEmptyString" };
            const isNonEmptyString = (s: string): s is NonEmptyString =>
                s.length > 0;
            const upperCaseOpt2 = (s: string | null) =>
                pipe(
                    O.fromNullable(s),
                    O.map((s) => s.toUpperCase()),
                    O.map(O.fromPredicate(isNonEmptyString)),
                    O.flatten
                    // O.chain(O.fromPredicate(isNonEmptyString))
                );

            expect(upperCaseOpt2("hello")).toEqual(O.some("HELLO"));
            expect(upperCaseOpt2(null)).toEqual(O.none);
            expect(upperCaseOpt2("")).toEqual(O.none);
        });

        it("Unpacking an Option", () => {
            const hello: O.Option<string> = O.some("hello");
            const empty: O.Option<string> = O.none;

            // getOrElse
            expect(O.getOrElse(() => "world")(hello)).toEqual("hello");
            expect(O.getOrElse(() => "world")(empty)).toEqual("world");

            // fold = getOrElse + map
            expect(
                pipe(
                    hello,
                    O.fold(
                        () => "world",
                        (s) => s.toUpperCase()
                    )
                )
            ).toEqual("HELLO");

            // getOrElseW = getOrElse with possible different return type
            expect(O.getOrElseW(() => 0)(hello)).toEqual("hello");
            expect(O.getOrElseW(() => 0)(empty)).toEqual(0);
        });
    });

    describe("Either", () => {
        describe("Constructing an Either", () => {
            // fromNullable
            const eitherStringOrNever = E.fromNullable("error")(null);
            const eitherStringOrNumber = E.fromNullable("error")(123);
            expect(eitherStringOrNever).toEqual(E.left("error"));
            expect(eitherStringOrNumber).toEqual(E.right(123));

            // of === right
            expect(E.of(null)).toEqual(E.right(null));

            // fromPredicate
            expect(
                E.fromPredicate(
                    (n: number) => n > 0,
                    () => "number must be greater than 0"
                )(0)
            ).toEqual(E.left("number must be greater than 0"));
            expect(
                E.fromPredicate(
                    (n: number) => n > 0,
                    () => "number must be greater than 0"
                )(1)
            ).toEqual(E.right(1));

            // fromOption
            expect(E.fromOption(() => "error")(O.none)).toEqual(
                E.left("error")
            );
            expect(E.fromOption(() => "error")(O.some(123))).toEqual(
                E.right(123)
            );
        });

        describe("map and flatMap / chain", () => {
            const upperCaseEither = (s: string | null) =>
                pipe(
                    E.fromNullable("string is null")(s),
                    E.map((s) => s.toUpperCase())
                );

            expect(upperCaseEither("hello")).toEqual(E.right("HELLO"));
            expect(upperCaseEither(null)).toEqual(E.left("string is null"));
            expect(upperCaseEither("")).toEqual(E.right(""));

            // What if we want to chain multiple operations that yield an Either?
            type NonEmptyString = string & { _tag: "NonEmptyString" };
            const isNonEmptyString = (s: string): s is NonEmptyString =>
                s.length > 0;
            const upperCaseEither2 = (s: string | null) =>
                pipe(
                    E.fromNullable("string is null")(s),
                    E.map((s) => s.toUpperCase()),
                    E.chain(
                        E.fromPredicate(
                            isNonEmptyString,
                            () => "string is empty"
                        )
                    )
                );

            expect(upperCaseEither2("hello")).toEqual(E.right("HELLO"));
            expect(upperCaseEither2(null)).toEqual(E.left("string is null"));
            expect(upperCaseEither2("")).toEqual(E.left("string is empty"));

            // Mapping the left side
            const upperCaseEither3 = flow(
                upperCaseEither2,
                E.mapLeft((error) => ({ error }))
            );
            expect(upperCaseEither3(null)).toEqual(
                E.left({ error: "string is null" })
            );
        });

        describe("Unpacking an Either", () => {
            const hello: E.Either<string, string> = E.right("hello");
            const empty: E.Either<string, string> = E.left("empty");

            // getOrElse - not really useful
            expect(E.getOrElse((error: string) => error)(hello)).toEqual(
                "hello"
            );
            expect(E.getOrElse((error: string) => error)(empty)).toEqual(
                "empty"
            );

            // fold - the way to go!
            expect(
                pipe(
                    hello,
                    E.fold(
                        (error) => error,
                        (s) => s
                    )
                )
            ).toEqual("hello");
            expect(
                pipe(
                    empty,
                    E.fold(
                        (error) => error,
                        (s) => s
                    )
                )
            ).toEqual("empty");
        });
    });

    describe("Traversing", () => {
        it("traverse", () => {
            const numbers: number[] = [1, 2, 3];
            const strings: string[] = ["1", "2", "3"];
            const parse = (s: string): O.Option<number> =>
                pipe(
                    parseInt(s),
                    O.fromPredicate((n) => !isNaN(n))
                );

            // if we mapped over the array, we would get an array of Option<number>
            const result = strings.map(parse);

            expect(result).toEqual([O.some(1), O.some(2), O.some(3)]);
            expect(["1", "not a number", "2"]).toEqual([
                O.some(1),
                O.none,
                O.some(2),
            ]);

            // However, we want to get None if any of the elements in the array cannot be parsed, and all the elements when they can be parsed.
            // This is where traverse comes in.
            const parseAll = O.traverseArray(parse);

            expect(parseAll(strings)).toEqual(O.some(numbers));
            expect(parseAll(["1", "2", "not a number"])).toEqual(O.none);

            // We could also achieve the same thing with map + sequenceArray
            const parseAll2 = flow(RA.map(parse), O.sequenceArray);

            expect(parseAll2(strings)).toEqual(O.some(numbers));
            expect(parseAll2(["1", "2", "not a number"])).toEqual(O.none);
        });
    });
});

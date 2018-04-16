export default interface IKind {
    toString(): string;

    // These need to be consistent with API path plurals.
    toPlural(): string;
}
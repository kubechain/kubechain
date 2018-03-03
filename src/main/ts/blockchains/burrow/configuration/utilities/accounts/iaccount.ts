import AccountRepresentation from "./representation";

export default interface IAccount {
    equalsType(type: string): boolean;

    toJSONFile(outputPath: string): void;

    toJSON(): AccountRepresentation;
}
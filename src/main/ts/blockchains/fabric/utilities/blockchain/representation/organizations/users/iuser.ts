import UserRepresentation from "./representation";

export default interface IUser {
    toJson(): UserRepresentation;
}
import IUser from "./iuser";
import User from "./user";
import UserRepresentation from "./representation";

export default class RegularUser implements IUser {
    private user: User;

    constructor(name: string, path: string) {
        this.user = new User(name, path, 'regular');
    }

    toJson(): UserRepresentation {
        return this.user.toJson();
    }
}
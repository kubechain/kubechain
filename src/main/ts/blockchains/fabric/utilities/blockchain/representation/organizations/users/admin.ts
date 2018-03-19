import User from "./user";
import IUser from "./iuser";
import UserRepresentation from "./representation";

export default class AdminUser implements IUser {
    private user: User;

    constructor(name: string, path: string) {
        this.user = new User(name, path, 'admin');
    }

    toJson(): UserRepresentation {
        return this.user.toJson();
    }
}
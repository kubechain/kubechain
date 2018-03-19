import IAccount from "./iaccount";
import Account from "./account";
import AccountRepresentation from "./representation";

export default class DeveloperAccount implements IAccount {
    private account: Account;

    constructor(name: string, path: string) {
        this.account = new Account(name, path, 'developer');
    }

    equalsType(type: string): boolean {
        return this.account.equalsType(type);
    }

    static pathMatchesType(path: string): boolean {
        return Account.pathMatchesType(path, 'developer');
    }

    toJSONFile(outputPath: string): void {
        this.account.toJSONFile(outputPath);
    }

    toJSON(): AccountRepresentation {
        return this.account.toJSON();
    }
}
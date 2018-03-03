import IAccount from "./iaccount";
import AccountType from "./account";

export default class ValidatorAccount implements IAccount {
    private accountType: AccountType;

    constructor(name: string, path: string) {
        this.accountType = new AccountType(name, path, 'validator');
    }

    equalsType(type: string): boolean {
        return this.accountType.equalsType(type);
    }

    static pathMatchesType(path: string): boolean {
        return AccountType.pathMatchesType(path, 'validator');
    }

    toJSONFile(outputPath: string): void {
        this.accountType.toJSONFile(outputPath);
    }

    toJSON(): any {
        return this.accountType.toJSON();
    }
}
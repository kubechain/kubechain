import IAccount from "./iaccount";
import AccountRepresentation from "./representation";

export default class UnknownAccount implements IAccount {
    equalsType() {
        return false;
    }

    static pathMatchesType() {
        return false;
    }

    toJSONFile() {
        throw new Error('Cannot create a JSON file for an unknown account type.');
    }

    toJSON(): AccountRepresentation {
        return {
            name: "",
            path: "",
            type: "",
            filePaths: {
                config: "",
                genesis: "",
                priv_validator: ""
            }
        };
    }
}
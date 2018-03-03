import IAccount from "./iaccount";
import * as fs from 'fs-extra';
import * as Path from 'path';
import AccountRepresentation from "./representation";

export default class Account implements IAccount {
    private name: string;
    private path: string;
    private type: string;
    private filePaths: {
        config: string;
        genesis: string;
        priv_validator: string
    };

    constructor(name: string, path: string, type: string) {
        this.name = name;
        this.path = path;
        this.type = type;

        this.filePaths = {
            "config": Path.join(path, 'config.toml'),
            "genesis": Path.join(path, 'genesis.json'),
            "priv_validator": Path.join(path, 'priv_validator.json')
        }
    }

    equalsType(type: string) {
        return this.type === type;
    }

    static pathMatchesType(path: string, type: string) {
        const match = Path.basename(path).match(type);
        return (match && match.length > 0);
    }

    toJSONFile(outputPath: string) {
        fs.outputFileSync(Path.join(outputPath, this.name + '.json'),
            JSON.stringify(this.toJSON(), null, 4));
    }

    toJSON(): AccountRepresentation {
        return {
            "name": this.name,
            "type": this.type,
            "path": this.path,
            "filePaths": this.filePaths
        }
    }
}
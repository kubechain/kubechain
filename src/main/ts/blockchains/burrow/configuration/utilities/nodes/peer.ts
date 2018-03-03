import * as fs from 'fs-extra';
import * as toml from 'toml';
import tomlify = require('tomlify-j0.4');
import INode from "./inode";
import Node from "./node"
import AccountRepresentation from "../accounts/representation";

export default class PeerNode implements INode {
    private accountRepresentation: AccountRepresentation;
    private seedAddresses: Array<string>;
    private node: Node;

    constructor(account: AccountRepresentation) {
        this.accountRepresentation = account;
        this.node = new Node(account);
        this.seedAddresses = [];
    }

    static equalsAccountType(type: string): boolean {
        return type !== 'full';
    }

    adjustConfigurationForKubernetes(): void {
        this.node.adjustConfigurationForKubernetes();
        this.changeConfigTomlFile();
    }

    private changeConfigTomlFile() {
        const configTomlPath = this.accountRepresentation.filePaths.config;
        try {
            const configTomlFileContents = fs.readFileSync(configTomlPath);
            const configTomlObject = toml.parse(configTomlFileContents.toString());
            configTomlObject.tendermint.configuration.seeds = this.seedAddresses.toString();
            fs.outputFileSync(configTomlPath, tomlify.toToml(configTomlObject));
        }
        catch (e) {
            console.error("Unable to change config.toml file contents:", configTomlPath);
            console.error("Reason:", e);
        }
    }

    setSeedAddresses(seedAddresses: string[]) {
        this.seedAddresses = seedAddresses
    }
}
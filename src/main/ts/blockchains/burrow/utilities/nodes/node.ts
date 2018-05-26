import * as fs from "fs-extra";
import * as toml from "toml";
import tomlify = require('tomlify-j0.4');
import * as Naming from "../../../../kubernetes-sdk/utilities/naming";
import AccountRepresentation from "../accounts/representation";

export default class Node {
    private accountRepresentation: AccountRepresentation;

    constructor(account: AccountRepresentation) {
        this.accountRepresentation = account;
    }

    adjustConfigurationForKubernetes() {
        this.changeConfigTomlFile();
        this.changeGenesisJsonFile();
    }

    private changeConfigTomlFile() {
        const configTomlPath = this.accountRepresentation.filePaths.config;
        try {
            const configTomlFileContents = fs.readFileSync(configTomlPath);
            const configTomlObject = toml.parse(configTomlFileContents.toString());
            configTomlObject.tendermint.configuration.moniker = Naming.toDNS1123(this.accountRepresentation.name);
            fs.outputFileSync(configTomlPath, tomlify.toToml(configTomlObject));
        }
        catch (e) {
            console.error("Unable to change config.toml file contents:", configTomlPath);
            console.error("Reason:", e);
        }
    }

    changeGenesisJsonFile() {
        const genesisJsonPath = this.accountRepresentation.filePaths.genesis;
        try {
            const genesisJsonFileContents = fs.readFileSync(genesisJsonPath);
            const genesisJsonObject = JSON.parse(genesisJsonFileContents.toString());
            this.changeObjectNamesToDNS1123(genesisJsonObject.accounts);
            this.changeObjectNamesToDNS1123(genesisJsonObject.validators);
            fs.outputFileSync(genesisJsonPath, JSON.stringify(genesisJsonObject, null, '\t'));
        }
        catch (e) {
            console.error("Unable to change config.toml file contents:", genesisJsonPath);
            console.error("Reason:", e);
        }
    }

    private changeObjectNamesToDNS1123(array: Array<{ name: string }>) {
        array.forEach(object => {
            object.name = Naming.toDNS1123(object.name);
        })
    }
}
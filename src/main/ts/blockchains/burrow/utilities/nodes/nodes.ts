import PeerNode from "./peer";
import Representation from "../accounts/representation";
import SeedNode from "./seed";
import INode from "./inode";
import UknownNode from "./unknown";
import * as toml from "toml";
import * as fs from "fs-extra";

function getPeerRepresentations(accounts: Representation[]): Representation[] {
    return accounts.filter((representation: Representation) => {
        const configTomlFileContents = fs.readFileSync(representation.filePaths.config);
        const configTomlObject = toml.parse(configTomlFileContents.toString());
        if (configTomlObject.tendermint.configuration.seeds !== "") {
            return representation;
        }
    });
}

function getSeedRepresentations(accounts: Representation[]): Representation[] {
    return accounts.filter((representation: Representation) => {
        const configTomlFileContents = fs.readFileSync(representation.filePaths.config);
        const configTomlObject = toml.parse(configTomlFileContents.toString());
        if (configTomlObject.tendermint.configuration.seeds === "") {
            return representation;
        }
    });
}

function accountRepresentationsToNodes(accounts: Representation[], amountOfSeeds: number): { seeds: SeedNode[], peers: PeerNode[] } {
    const seeds: SeedNode[] = [];
    const peers: PeerNode[] = [];

    for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        if (i < amountOfSeeds) {
            seeds.push(new SeedNode(account));
        }
        else {
            peers.push(new PeerNode(account));
        }
    }

    return {
        seeds: seeds,
        peers: peers
    };
}

export {getSeedRepresentations, getPeerRepresentations, accountRepresentationsToNodes};
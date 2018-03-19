import PeerNode from "./peer";
import Representation from "../accounts/representation";
import SeedNode from "./seed";
import INode from "./inode";
import UknownNode from "./unknown";

const nodeTypes = [PeerNode, SeedNode];

function getNodeForAccount(account: Representation): INode {
    for (let index = 0; index < nodeTypes.length; index++) {
        const NodeType = nodeTypes[index];
        if (NodeType.equalsAccountType(account.type)) {
            return new NodeType(account);
        }
    }

    return new UknownNode();
}

function getPeers(accounts: Representation[]): PeerNode[] {
    const peers: PeerNode[] = [];
    accounts.forEach(account => {
        if (PeerNode.equalsAccountType(account.type)) {
            peers.push(new PeerNode(account));
        }
    });
    return peers;
}

function getPeerRepresentations(accounts: Representation[]): Representation[] {
    return accounts.filter((representation: Representation) => {
        return PeerNode.equalsAccountType(representation.type)
    });
}

function getSeeds(accounts: Representation[]): SeedNode[] {
    const seeds: SeedNode[] = [];
    accounts.forEach(account => {
        if (SeedNode.equalsAccountType(account.type)) {
            seeds.push(new SeedNode(account));
        }
    });
    return seeds;
}

function getSeedRepresentations(accounts: Representation[]): Representation[] {
    return accounts.filter((representation: Representation) => {
        return SeedNode.equalsAccountType(representation.type)
    });
}

export {getPeers, getSeeds, getSeedRepresentations, getPeerRepresentations};
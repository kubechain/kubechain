import INode from "./inode";
import Node from "./node"
import AccountRepresentation from "../accounts/representation";
import * as Naming from "../../../../kubernetes-sdk/utilities/naming";

export default class SeedNode implements INode {
    private accountRepresentation: AccountRepresentation;
    private node: Node;

    constructor(account: AccountRepresentation) {
        this.accountRepresentation = account;
        this.node = new Node(account);
    }

    adjustConfigurationForKubernetes() {
        this.node.adjustConfigurationForKubernetes();
    }

    addPeerToPeerAddressToArray(array: string[], serviceName: string, namespace: string) {
        const peer2peerPort = 46656;
        const address = Naming.fullyQualifiedDomainName(Naming.toDNS1123(this.accountRepresentation.name), serviceName, namespace) + ':' + peer2peerPort;
        array.push(address);
    }
}
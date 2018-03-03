import INode from "./inode";
import Node from "./node"
import AccountRepresentation from "../accounts/representation";
import * as Naming from "../../../../../kubernetes-sdk/utilities/naming";

export default class SeedNode implements INode {
    private accountRepresentation: AccountRepresentation;
    private node: Node;

    constructor(account: AccountRepresentation) {
        this.accountRepresentation = account;
        this.node = new Node(account);
    }

    static equalsAccountType(type: string): boolean {
        return type === 'full';
    }

    adjustConfigurationForKubernetes() {
        this.node.adjustConfigurationForKubernetes();
    }

    addFullyQualifiedDomainNameToArray(array: string[], serviceName: string, namespace: string) {
        array.push(Naming.fullyQualifiedDomainName(Naming.toDNS1123(this.accountRepresentation.name), serviceName, namespace));
    }
}
import INode from "./inode";

export default class UknownNode implements INode {
    adjustConfigurationForKubernetes(): void {
        throw new Error('Cannot change configuration for an unknown node type.')
    }
}
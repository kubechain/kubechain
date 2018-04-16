import Organization from "./organization";

import *as  fs from 'fs-extra';
import * as Path from 'path';
import Peer from "./entities/peer";
import IOrganization from "./iorganization";
import OrganizationRepresentation from "./representation";

export default class PeerOrganization implements IOrganization {
    private organization: Organization;
    private path: string;

    constructor(name: string, path: string) {
        this.path = path;
        this.organization = new Organization(name, path, 'peer');
        this.addPeers();
    }

    private addPeers() {
        const orderersPath = Path.join(this.path, 'peers');
        fs.readdirSync(orderersPath).forEach(ordererName => {
            this.organization.addEntity(new Peer(ordererName, Path.join(orderersPath, ordererName)));
        })
    }

    toJson(): OrganizationRepresentation {
        return this.organization.toJson();
    }

}
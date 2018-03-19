import * as  fs from 'fs-extra';
import * as Path from 'path';
import Organization from "./organization";
import Orderer from "./entities/orderer";
import IOrganization from "./iorganization";
import OrganizationRepresentation from "./representation";

export default class OrdererOrganization implements IOrganization {
    private organization: Organization;
    private path: string;

    constructor(name: string, path: string) {
        this.path = path;
        this.organization = new Organization(name, path, 'orderer');
        this.addOrderers();
    }

    private addOrderers() {
        const orderersPath = Path.join(this.path, 'orderers');
        fs.readdirSync(orderersPath).forEach(ordererName => {
            this.organization.addEntity(new Orderer(ordererName, Path.join(orderersPath, ordererName)))
        })
    }

    toJson(): OrganizationRepresentation {
        return this.organization.toJson();
    }
}
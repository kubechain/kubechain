import * as  fs from 'fs-extra';
import * as  Path from 'path';
import Kubechain from "../../../../../kubechain";
import Options from '../../../options';
import OrdererOrganization from "./organizations/orderer";
import PeerOrganization from "./organizations/peer";
import OrganizationRepresentation from "./organizations/representation";
import KubechainTargets from "../../../../../targets";


export default class RepresentationCreator {
    private options: Options;

    constructor(targets: KubechainTargets) {
        this.options = new Options(new Kubechain(targets));
    }

    createOrdererRepresentations(): OrganizationRepresentation[] {
        const ordererOrganizationsPath = this.options.get('$.blockchain.organizations.paths.ordererorganizations');
        const representations: OrganizationRepresentation[] = []
        this.createOrganizations(ordererOrganizationsPath, (name: string, path: string) => {
            representations.push(new OrdererOrganization(name, path).toJson())
        });
        return representations;
    }

    createPeerRepresentations(): OrganizationRepresentation[] {
        const ordererOrganizationsPath = this.options.get('$.blockchain.organizations.paths.peerorganizations');
        const representations: OrganizationRepresentation[] = [];
        this.createOrganizations(ordererOrganizationsPath, (name: string, path: string) => {
            representations.push(new PeerOrganization(name, path).toJson())
        });
        return representations;

    }

    private createOrganizations(path: string, createFunction: Function) {
        fs.readdirSync(path).forEach((organizationName: string) => {
            createFunction(organizationName, Path.join(path, organizationName));
        });
    }
}
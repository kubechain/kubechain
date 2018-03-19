import IAdapter from "../../../utilities/iadapter";
import Options from "../../options";
import Kubechain from "../../../../kubechain";
import OrdererOrganization from "./organizations/orderer";
import PeerOrganization from "./organizations/peer";
import RepresentationCreator from "../../utilities/blockchain/representation/creator";
import OrganizationRepresentation from "../../utilities/blockchain/representation/organizations/representation";

export default class MinikubeAdapter implements IAdapter {
    private options: Options;
    private creator: RepresentationCreator;

    constructor() {
        this.options = new Options(new Kubechain());
        this.creator = new RepresentationCreator();
    }

    matchesBlockchainTarget(target: string): boolean {
        return target && target.toLowerCase() === 'fabric';
    }

    matchesKubernetesTarget(target: string): boolean {
        return target && target.toLowerCase() === 'minikube';
    }

    start(): any {
        console.info('[KUBERNETES CONFIGURATION]');
        this.createOrganizations();
    }

    private createOrganizations() {
        this.creator.createOrdererRepresentations().forEach((representation: OrganizationRepresentation) => {
            new OrdererOrganization(this.options, representation).createKubernetesResources();
        });
        this.creator.createPeerRepresentations().forEach((representation: OrganizationRepresentation) => {
            new PeerOrganization(this.options, representation).createKubernetesResources();
        });
    }
}
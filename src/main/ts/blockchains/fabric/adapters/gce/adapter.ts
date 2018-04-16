import IAdapter from "../../../utilities/iadapter";
import Options from "../../options";
import Kubechain from "../../../../kubechain";
import OrdererOrganization from "./organizations/orderer";
import PeerOrganization from "./organizations/peer";
import RepresentationCreator from "../../utilities/blockchain/representation/creator";
import OrganizationRepresentation from "../../utilities/blockchain/representation/organizations/representation";
import KubechainTargets from "../../../../targets";

export default class Adapter implements IAdapter {
    private options: Options;
    private creator: RepresentationCreator;

    constructor() {
        const targets: KubechainTargets = {
            blockchain: {name: 'fabric'},
            kubernetes: {name: 'gce'}
        };
        this.options = new Options(new Kubechain(targets));
        this.creator = new RepresentationCreator(targets);
    }

    matchesBlockchainTarget(target: string): boolean {
        return target && target.toLowerCase() === 'fabric';
    }

    matchesKubernetesTarget(target: string): boolean {
        return target && target.toLowerCase() === 'gce';
    }

    matchesTargets(targets: KubechainTargets): boolean {
        //TODO: Change to targets.matchesBlockchainTarget('fabric')..
        return this.matchesBlockchainTarget(targets.blockchain.name) && this.matchesKubernetesTarget(targets.kubernetes.name);
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
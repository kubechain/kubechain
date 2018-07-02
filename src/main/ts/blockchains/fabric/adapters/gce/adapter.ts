import IAdapter from "../../../utilities/iadapter";
import Options from "../../options";
import Kubechain from "../../../../kubechain/kubechain";
import OrdererOrganization from "./organizations/orderer";
import PeerOrganization from "./organizations/peer";
import RepresentationCreator from "../../utilities/blockchain/representation/creator";
import OrganizationRepresentation from "../../utilities/blockchain/representation/organizations/representation";
import KubechainTargets from "../../../../kubechain/targets";
import ResourceWriter from "../../utilities/blockchain/resourcewriter/resourcewriter";
import * as KubernetesClient from "kubernetes-client";
import Service from "../../../../kubernetes-sdk/utilities/kinds/namespaced/service";
import CrudResource from "../../../../kubernetes-sdk/utilities/resources/crud/crud-resource";
import FabricHooks from "../../utilities/blockchain/hooks";

export default class Adapter implements IAdapter {
    private options: Options;
    private creator: RepresentationCreator;
    private hooks: FabricHooks;
    private writer: ResourceWriter;
    private client: KubernetesClient.Client;

    constructor(kubechain: Kubechain) {
        this.options = new Options(kubechain);
        this.creator = new RepresentationCreator(kubechain);
        this.hooks = this.options.get('$.hooks');
        this.writer = new ResourceWriter(this.hooks);
    }

    matchesTargets(targets: KubechainTargets): boolean {
        return targets.matchesBlockchainTarget('fabric') && targets.matchesKubernetesTarget('gce');
    }

    async start() {
        console.info('[KUBERNETES CONFIGURATION]');
        await this.createRepresentations();
        this.write();
    }

    private async createRepresentations() {
        const ordererRepresentations = this.creator.createOrdererRepresentations();
        const peerRepresentations = this.creator.createPeerRepresentations();

        this.hooks.createdRepresentations({
            orderers: ordererRepresentations,
            peers: peerRepresentations,
            options: this.options
        });

        console.info('Creating Orderer Organizations');
        ordererRepresentations.forEach((representation: OrganizationRepresentation) => {
            this.hooks.creatingOrganization({representation: representation, options: this.options});
            new OrdererOrganization(this.options, representation).addResources(this.writer);
        });

        console.info('Creating Peer Organizations');
        const kubeDnsServiceClusterIP = await this.getKubeDnsServiceClusterIp();
        for (let i = 0; i < peerRepresentations.length; i++) {
            const representation = peerRepresentations[i];
            this.hooks.creatingOrganization({representation: representation, options: this.options});
            await new PeerOrganization(this.options, representation, kubeDnsServiceClusterIP).addResources(this.writer);
        }
    }

    private async getKubeDnsServiceClusterIp() {
        console.info('Hyperledger Fabric creates ChainCode containers without appropriate dns-search options.');
        console.info('Please provide your cluster-context so the correct dns-search options can be set.');
        this.createKubernetesClient(this.options.get('$.kubernetes.context'));
        const resource = {
            "apiVersion": "v1",
            "metadata": {
                "name": "kube-dns",
                "namespace": "kube-system"
            }
        };
        const crud = new CrudResource(resource, new Service());
        console.info("Getting kube-dns service IP-address");
        const response = await crud.get(this.client, undefined);
        if (response && response.body) {
            return response.body.spec.clusterIP;
        }
        else {
            throw new Error("Unable to find kube-dns service IP-address.");
        }
    }

    private createKubernetesClient(context: string) {
        console.info("Setting up kubernetes-client");
        const Client = KubernetesClient.Client;
        const config = KubernetesClient.config;
        this.client = new Client({
            config: config.fromKubeconfig(undefined, context),
            version: '1.8'
        });
    }

    private write() {
        this.writer.write();
    }
}
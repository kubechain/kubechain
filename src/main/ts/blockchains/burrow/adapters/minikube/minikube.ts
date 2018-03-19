import IAdapter from "../../../utilities/iadapter";
import * as Path from "path";
import * as Accounts from "../../utilities/accounts/accounts";
import * as Nodes from "../../utilities/nodes/nodes";
import ServicePort from "../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/ports/serviceport";
import AccountRepresentation from "../../utilities/accounts/representation";
import * as fs from "fs-extra";
import Namespace from "../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import AccountPod from "./accountpod";
import IResource from "../../../../kubernetes-sdk/api/1.8/iresource";
import ClusterIPNoneService from "../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/clusterip/clusteripnone";
import Options from "../../options";
import Kubechain from "../../../../kubechain";

export default class MinikubeAdapter implements IAdapter {
    private options: Options;

    constructor() {
        this.options = new Options(new Kubechain());
    }

    matchesBlockchainTarget(target: string) {
        return target && target.toLowerCase() === 'burrow';
    }

    matchesKubernetesTarget(target: string): boolean {
        return target && target.toLowerCase() === 'minikube';
    }

    start(): any {
        console.info('[KUBERNETES]');
        this.createNamespace();
        this.createService();
        this.createAccountsFromRepresentations();
    }

    private createNamespace() {
        console.info('Creating namespace');
        const namespace = new Namespace(this.options.get('$.name'));
        this.resourceToJsonFile(namespace, this.options.get('$.name') + '-namespace');
    }

    private createService() {
        console.info('Creating service');
        const service = new ClusterIPNoneService(this.options.get('$.name'), this.options.get('$.name'));
        service.addMatchLabel("app", this.options.get('$.name'));

        service.addServicePort(new ServicePort("p2p", 46656));
        service.addServicePort(new ServicePort("rpc", 46657));
        service.addServicePort(new ServicePort("api", 1337));
        this.resourceToJsonFile(service, this.options.get('$.name') + '-service');
    }


    private createAccountsFromRepresentations() {
        console.info('Creating account pods');

        const representations = Accounts.getAccountRepresentationsFromPath(this.options.get('$.blockchain.intermediate.paths.configuration'));
        this.createSeeds(representations);
        this.createPeers(representations);
    }

    private createSeeds(representations: AccountRepresentation[]) {
        const seedsRepresentations = Nodes.getSeedRepresentations(representations);
        seedsRepresentations.forEach(representation => {
            const seedPod = new AccountPod(representation, this.options.get('$.name'), this.options);
            seedPod.toJsonFile(this.options.get('$.kubernetes.paths.seeds'));
        })
    }

    private createPeers(representations: AccountRepresentation[]) {
        const peerRepresentation = Nodes.getPeerRepresentations(representations);
        peerRepresentation.forEach(representation => {
            const peerPod = new AccountPod(representation, this.options.get('$.name'), this.options);
            peerPod.toJsonFile(this.options.get('$.kubernetes.paths.peers'));
        })
    }

    //TODO: Duplication, remove.
    resourceToJsonFile(resource: IResource, fileName: string) {
        const rootPath = this.options.get('$.kubernetes.paths.root');
        fs.outputFileSync(Path.join(rootPath, fileName + '.json'), JSON.stringify(resource.toJson(), null, 4));
    }
}
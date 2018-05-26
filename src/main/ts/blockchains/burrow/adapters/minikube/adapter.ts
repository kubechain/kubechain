import IAdapter from "../../../utilities/iadapter";
import * as Path from "path";
import * as Accounts from "../../utilities/accounts/accounts";
import * as Nodes from "../../utilities/nodes/nodes";
import ServicePort from "../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/ports/serviceport";
import AccountRepresentation from "../../utilities/accounts/representation";
import * as fs from "fs-extra";
import Namespace from "../../../../kubernetes-sdk/api/1.8/cluster/namespace";
import AccountWorkload from "./accountworkload";
import IResource from "../../../../kubernetes-sdk/api/1.8/iresource";
import ClusterIPNoneService from "../../../../kubernetes-sdk/api/1.8/discovery-load-balancing/services/clusterip/clusteripnone";
import Options from "../../options";
import Kubechain from "../../../../kubechain/kubechain";
import KubechainTargets from "../../../../kubechain/targets";
import IHooks from "../../../utilities/iadapterhooks";

export default class Adapter implements IAdapter {
    private options: Options;
    private hooks: IHooks;
    private resources: Array<{ fileName: string, resource: IResource }>;
    private workloads: Array<{ path: string, workload: AccountWorkload }>;

    constructor(kubechain: Kubechain) {
        this.options = new Options(kubechain);
        this.hooks = this.options.get('$.hooks');
        this.resources = [];
        this.workloads = [];
    }

    matchesTargets(targets: KubechainTargets): boolean {
        return targets.matchesBlockchainTarget('burrow') && targets.matchesKubernetesTarget('minikube');
    }

    start(): any {
        try {
            console.info('[KUBERNETES]');
            this.createNamespace();
            this.createService();
            this.createAccountsFromRepresentations();
            this.write();
        }
        catch (e) {
            console.error(e);
        }
    }

    private createNamespace() {
        console.info('Creating namespace');
        const namespace = new Namespace(this.options.get('$.name'));
        this.resources.push({
            fileName: this.options.get('$.name') + '-namespace',
            resource: namespace
        })
    }

    private createService() {
        console.info('Creating service');
        const service = new ClusterIPNoneService(this.options.get('$.name'), this.options.get('$.name'));
        service.addMatchLabel("app", this.options.get('$.name'));

        service.addServicePort(new ServicePort("p2p", 46656));
        service.addServicePort(new ServicePort("rpc", 46657));
        service.addServicePort(new ServicePort("api", 1337));
        this.resources.push({
            fileName: this.options.get('$.name') + '-service',
            resource: service
        })
    }

    private createAccountsFromRepresentations() {
        console.info('Creating account pods');
        //hooks.beforeCreateRepresentations
        const representations = Accounts.getAccountRepresentationsFromPath(this.options.get('$.blockchain.intermediate.paths.configuration'));
        this.hooks.createdRepresentations({
            representations: representations,
            namespace: this.options.get('$.name'),
            service: this.options.get('$.name')
        });
        this.createWorkloads(representations);
    }

    private createWorkloads(representations: AccountRepresentation[]) {
        // hooks.beforeCreateWorkloads();
        this.createSeeds(representations);
        this.createPeers(representations);
        // hooks.createdWorkloads();
    }

    private createSeeds(representations: AccountRepresentation[]) {
        console.info("Creating seeds");
        const seedRepresentations = Nodes.getSeedRepresentations(representations);
        seedRepresentations.forEach(representation => {
            const seedWorkload = new AccountWorkload(representation, this.options.get('$.name'), this.options);
            this.workloads.push({path: this.options.get('$.kubernetes.paths.seeds'), workload: seedWorkload});
        })
    }

    private createPeers(representations: AccountRepresentation[]) {
        console.info("Creating peers");
        const peerRepresentation = Nodes.getPeerRepresentations(representations);
        peerRepresentation.forEach(representation => {
            const peerWorkload = new AccountWorkload(representation, this.options.get('$.name'), this.options);
            this.workloads.push({path: this.options.get('$.kubernetes.paths.peers'), workload: peerWorkload});
        })
    }

    private write() {
        this.hooks.beforeWrite({resources: this.resources, workloads: this.workloads});
        this.resources.forEach((resource) => {
            this.resourceToJsonFile(resource.resource, resource.fileName);
        });
        this.workloads.forEach((workload) => {
            workload.workload.write(workload.path);
        });
        // this.hooks.written({resources: this.resources, workloads: this.workloads});
    }

    //TODO: Duplication, remove.
    resourceToJsonFile(resource: IResource, fileName: string) {
        const rootPath = this.options.get('$.kubernetes.paths.root');
        fs.outputFileSync(Path.join(rootPath, fileName + '.json'), JSON.stringify(resource.toJson(), null, 4));
    }
}
import * as fs from 'fs';
import * as  path from 'path';
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Options from "../../options";
import Kubechain from "../../../../kubechain/kubechain";
import KubernetesResourceCreator from "../../../../kubernetes-sdk/utilities/resources/resourcecreator";

export default class ClusterCreator implements ICommandExecutor {
    private options: Options;
    private context: string;

    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    async create(kubechain: Kubechain) {
        this.options = new Options(kubechain);
        try {
            console.info('[CREATING]');
            this.context = this.options.get('$.kubernetes.context');
            await this.launchOrdererOrganizations();
            await this.launchPeerOrganizations();
            await this.postLaunch();
        }
        catch (e) {
            console.error("Unable to create cluster.");
            console.error(e);
        }
    }

    private async launchOrdererOrganizations() {
        console.info('[ORDERER-ORGANISATIONS]');
        return this.createOrganizations(this.options.get('$.kubernetes.paths.ordererorganizations'));
    }

    private async launchPeerOrganizations() {
        console.info('[PEER-ORGANISATIONS]');
        return this.createOrganizations(this.options.get('$.kubernetes.paths.peerorganizations'));
    }

    private async createOrganizations(basePath: string) {
        const organizationPaths = fs.readdirSync(basePath);
        for (let index = 0; index < organizationPaths.length; index++) {
            const organizationName = organizationPaths[index];
            console.info('[ORGANIZATION] -', organizationName);
            await this.createOrganization(basePath, organizationName);
        }
        return Promise.resolve();
    }

    private createOrganization(basePath: string, name: string) {
        const organizationPath = path.join(basePath, name);
        const creator = new KubernetesResourceCreator(name, this.context);
        return creator.createResourcesFoundInDirectoryTree(organizationPath);
    }

    private postLaunch() {
        const creator = new KubernetesResourceCreator("default", this.context);
        return creator.createResourcesFoundInDirectoryTree(this.options.get('$.kubernetes.paths.postlaunch'));
    }
}
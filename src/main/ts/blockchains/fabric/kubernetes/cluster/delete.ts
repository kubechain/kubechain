import * as fs from 'fs';
import * as path from 'path';
import Options from '../../options';
import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from '../../../../kubechain/kubechain';
import KubernetesResourceDeleter from '../../../../kubernetes-sdk/utilities/resources/resourcedeleter';
import {promptUserForDesiredContext} from "../../../utilities/cluster";

export default class ClusterDeleter implements ICommandExecutor {
    private options: Options;
    private context: string;

    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    async delete(kubechain: Kubechain) {
        this.options = new Options(kubechain);
        try {
            console.info('[REMOVING]');
            this.context = await promptUserForDesiredContext();
            await this.removeOrdererOrganizations();
            await this.deletePeerOrganizations();
        }
        catch (e) {
            console.error("Unable to delete cluster.");
            console.error(e);
        }
    }

    private removeOrdererOrganizations() {
        console.info('[ORDERER-ORGANISATIONS]');
        return this.deleteOrganizations(this.options.get('$.kubernetes.paths.ordererorganizations'));
    }

    private async deletePeerOrganizations() {
        console.info('[PEER-ORGANISATIONS]');
        return this.deleteOrganizations(this.options.get('$.kubernetes.paths.peerorganizations'));
    }

    private async deleteOrganizations(basePath: string) {
        const organizationPaths = fs.readdirSync(basePath);
        for (let index = 0; index < organizationPaths.length; index++) {
            const organizationName = organizationPaths[index];
            console.info('[ORGANIZATION] -', organizationName);
            await this.deleteOrganization(basePath, organizationName);
        }
        return Promise.resolve();
    }

    private deleteOrganization(basePath: string, name: string) {
        const organizationPath = path.join(basePath, name);
        const resourceDeleter = new KubernetesResourceDeleter(name, this.context);
        return resourceDeleter.deleteResourcesFoundInDirectoryTree(organizationPath);
    }
}

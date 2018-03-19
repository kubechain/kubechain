import * as fs from 'fs-extra'
import * as KubernetesClient from 'kubernetes-client'
import KubernetesResourceGatherer from './resourcegatherer';
import * as Kinds from '../kinds/kinds'
import IKind from "../kinds/ikind";
import Deployment from "../kinds/namespaced/deployment";
import PersistentVolumeClaim from "../kinds/namespaced/persistentvolumeclaim";

export default class KubernetesResourceCreator {
    private namespace: string;
    private doNotCreateKinds: any[];
    private gatherer: KubernetesResourceGatherer;
    private kubernetesCoreClient: any;
    private kubernetesApiClient: KubernetesClient.Api;
    private resourcePathsGroupedByKind: any;

    constructor(namespace: string) {
        this.namespace = namespace;
        this.doNotCreateKinds = [];
        this.gatherer = new KubernetesResourceGatherer(this.namespace);
        this.kubernetesCoreClient = new KubernetesClient.Core({
            url: 'http://localhost:8001', //TODO: Might want to make this an option.
            version: 'v1',
            namespace: namespace,
            promises: true
        });

        this.kubernetesApiClient = new KubernetesClient.Api({
            url: 'http://localhost:8001',
            promises: true,
            namespace: namespace
        });

    }

    doNotCreateKind(kind: string) {
        this.gatherer.doNotGather(kind);
    }

    async createResourcesFoundInDirectoryTree(path: string) {
        try {
            this.resourcePathsGroupedByKind = await this.gatherer.gatherResourcePathsFoundInDirectoryTreeGroupedByKind(path);
            await this.createAll();
        }
        catch (e) {
            console.error(e);
        }
    }

    async createResourcesFoundInDirectory(path: string) {
        try {
            this.resourcePathsGroupedByKind = await this.gatherer.gatherResourcePathsFoundInDirectoryGroupedByKind(path);
            await this.createAll();
        }
        catch (e) {
            console.error(e);
        }
    }

    private async createAll() {
        try {
            await this.createResourcesWithoutNamespace();
            await this.createResourcesWithNamespace();
            return Promise.resolve();
        }
        catch (e) {
            console.error(e);
        }
    }

    private async createResourcesWithoutNamespace() {
        const kinds: IKind[] = Kinds.kindsWithoutNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Creating ${kind} resources.`);
            try {
                await KubernetesResourceCreator.createResources(this.resourcePathsGroupedByKind[kind.toString()], kind.toString(), (resource: any) => {
                    return this.kubernetesCoreClient[kind.toString().toLowerCase()].post({body: resource});
                });
            }
            catch (error) {
                console.error(`Unable to create ${kind} resources.`);
                console.error("Reason:", error);
            }
        }
        return Promise.resolve();
    }

    //TODO: This method depends on the order of Kinds.kindsWithNamespace(). THIS IS BAD. Change so it doesn't.
    private async createResourcesWithNamespace() {
        const kinds: IKind[] = Kinds.kindsWithNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Creating ${kind.toString()} resources.`);
            try {
                const resourcePaths = this.resourcePathsGroupedByKind[kind.toString()];
                if (kind.toString() === Deployment.toString() && resourcePaths.length > 0) {
                    await this.checkPersistentVolumeClaimsStatusIsBound()
                }
                await KubernetesResourceCreator.createResources(resourcePaths, kind.toString(), (resource: any) => {
                    return this.kubernetesApiClient.group(resource).namespaces.kind(resource).post({body: resource});
                });
            }
            catch (error) {
                console.error(`Unable to create ${kind.toString()} resources.`);
                console.error("Reason:", error);
            }
        }
        return Promise.resolve();
    }

    private async checkPersistentVolumeClaimsStatusIsBound() {
        console.info("Checking if PersistentVolumeClaims have been bound.");
        const persistentVolumeClaimPaths = this.resourcePathsGroupedByKind[PersistentVolumeClaim.toString()];
        for (let index = 0; index < persistentVolumeClaimPaths.length; index++) {
            try {
                const persistentVolumeClaim = JSON.parse(fs.readFileSync(persistentVolumeClaimPaths[index]).toString());
                console.info('Checking claim:', persistentVolumeClaim.metadata.name);
                await this.requestPersistentVolumeClaimWithRetry(persistentVolumeClaim);
            }
            catch (e) {
                console.error(e);
            }
        }

        return Promise.resolve();
    }

    private async requestPersistentVolumeClaimWithRetry(persistentVolumeClaim: any) {
        const MAX_RETRIES = 10;
        for (let i = 0; i <= MAX_RETRIES; i++) {
            try {
                const response = await this.kubernetesCoreClient.namespaces.persistentvolumeclaims.get(persistentVolumeClaim.metadata.name);
                if (response && KubernetesResourceCreator.claimIsBound(response)) {
                    console.info(`Claim ${persistentVolumeClaim.metadata.name}: Has been bound.`);
                    return Promise.resolve(response);
                }

            } catch (err) {
                console.error(err);
                const timeout = Math.pow(2, i);
                console.log('Waiting:', timeout, 'ms');
                setTimeout(() => {
                }, timeout);
                console.log('Retrying');
            }
        }
        return Promise.reject(`Binding for "${persistentVolumeClaim.metadata.name}" could not be found.`);
    }

    static claimIsBound(response: any) {
        return response && response.status && response.status.phase && response.status.phase === "Bound";
    }

    static async createResources(resourcePaths: any, kind: string, createFunction: Function) {
        for (let index = 0; index < resourcePaths.length; index++) {
            const resourcePath = resourcePaths[index];
            const resource = JSON.parse(fs.readFileSync(resourcePath).toString());
            try {
                await createFunction(resource);
                console.info(`Successfully created ${kind}: ${resource.metadata.name}`);
            }
            catch (error) {
                if (error && error.message) {
                    const errorMessageMatch = error.message.match('already exists');
                    if (errorMessageMatch) {
                        console.warn(`${kind} already exists: ${resource.metadata.name}`);
                    }
                    else {
                        console.error(`Unable to create ${kind}: ${resource.metadata.name}`);
                        console.error("Reason:", error);
                    }
                }
            }
        }

        return Promise.resolve();
    }
}
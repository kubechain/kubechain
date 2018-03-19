import * as KubernetesClient from 'kubernetes-client';
import * as fs from 'fs-extra';
import KubernetesResourceGatherer from './resourcegatherer';
import * as Kinds from '../kinds/kinds';
import IKind from "../kinds/ikind";

export default class KubernetesResourceDeleter {
    private gatherer: KubernetesResourceGatherer;
    private kubernetesApiClient: KubernetesClient.Api;
    private kubernetesCoreClient: any;
    private resourcePathsGroupedByKind: any;

    constructor(namespace: string) {
        this.gatherer = new KubernetesResourceGatherer(namespace);
        this.kubernetesApiClient = new KubernetesClient.Api({
            url: 'http://localhost:8001',
            namespace: namespace,
            promises: true
        });
        this.kubernetesCoreClient = new KubernetesClient.Core({
            url: 'http://localhost:8001',
            promises: true
        });
    }

    doNotDelete(kind: string) {
        this.gatherer.doNotGather(kind);
    }

    async deleteResourcesFoundInDirectoryTree(path: string) {
        try {
            this.resourcePathsGroupedByKind = await this.gatherer.gatherResourcePathsFoundInDirectoryTreeGroupedByKind(path);
            return this.deleteAll();
        }
        catch (e) {
            console.error(e);
        }
    }

    async deleteAll() {
        try {
            await this.deleteResourcesWithoutNamespace();
            await this.deleteResourcesWithNamespace();
            return Promise.resolve();
        }
        catch (e) {
            console.error(e);
        }
    }


    /**
     * Deletes resources which have a kind without a namespace. Such as Namespace and PersistentVolume.
     * This function exists because the kind of resources without a namespace cannot be derived via `.kind()`.
     * As it is part of the class`Namespaces`. Normally an instance of `Namespaces` exists in an `ApiGroup`.
     * However, this is not the case for kinds without a namespace.
     * @private
     */
    async deleteResourcesWithoutNamespace() {
        const kinds: IKind[] = Kinds.kindsWithoutNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Deleting ${kind.toString()} resources.`);
            try {
                await KubernetesResourceDeleter.deleteResources(this.resourcePathsGroupedByKind[kind.toString()], kind.toString(), (resource: any) => {
                    return this.kubernetesCoreClient[kind.toString().toLowerCase()].delete(resource.metadata.name);
                });
            }
            catch (error) {
                console.error(`Unable to delete ${kind.toString()} resources.`);
                console.error("Reason:", error);
            }
        }
        return Promise.resolve();
    }

    /**
     * Deletes resources which have a kind with a namespace.
     * @private
     * @return {Promise<[*]>}
     */
    async deleteResourcesWithNamespace() {
        const kinds: IKind[] = Kinds.kindsWithNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Deleting ${kind.toString()} resources.`);
            try {
                await KubernetesResourceDeleter.deleteResources(this.resourcePathsGroupedByKind[kind.toString()], kind.toString(), (resource: any) => {
                    return this.kubernetesApiClient.group(resource).namespaces.kind(resource).delete(resource.metadata.name);
                });
            }
            catch (error) {
                console.error(`Unable to delete ${kind.toString()} resources.`);
                console.error("Reason:", error);
            }
        }

        return Promise.resolve();
    }

    static async deleteResources(resourcePaths: string[], kind: string, deleteFunction: Function) {
        for (let index = 0; index < resourcePaths.length; index++) {
            const resourcePath = resourcePaths[index];
            const resource = JSON.parse(fs.readFileSync(resourcePath).toString());
            try {
                await deleteFunction(resource);
                console.info(`Successfully deleted ${kind}: ${resource.metadata.name}`);
            }
            catch (error) {
                if (error && error.message) {
                    const errorMessageMatch = error.message.match('not found');
                    if (errorMessageMatch) {
                        console.warn(`Unable to delete ${kind}: ${resource.metadata.name}`);
                        console.warn("Reason:", `Could not find ${kind}: ${resource.metadata.name}`);
                    }
                    else {
                        console.error(`Unable to delete ${kind}: ${resource.metadata.name}`);
                        console.error("Reason:", error);
                    }
                }
            }
        }
        return Promise.resolve();
    }
}
const KubernetesClient = require('kubernetes-client');
const fs = require('fs-extra');
const KubernetesResourceGatherer = require('./resourcegatherer');
const Kinds = require('./kinds');

class KubernetesResourceDeleter {
    constructor(namespace) {
        this._namespace = namespace;
        this._gatherer = new KubernetesResourceGatherer(this._namespace);
        this._kubernetesApiClient = new KubernetesClient.Api({
            url: 'http://localhost:8001',
            namespace: namespace,
            promises: true
        });
        this._kubernetesCoreClient = new KubernetesClient.Core({
            url: 'http://localhost:8001',
            promises: true
        });
    }

    doNotDelete(kind) {
        this._gatherer.doNotGather(kind);
    }

    async deleteResourcesFoundInDirectoryTree(path) {
        try {
            this._resourcePathsGroupedByKind = await this._gatherer.gatherResourcePathsFoundInDirectoryTreeGroupedByKind(path);
            return this._deleteAll();
        }
        catch (e) {
            console.error(e);
        }
    }

    async _deleteAll() {
        try {
            await this._deleteResourcesWithoutNamespace();
            await this._deleteResourcesWithNamespace();
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
    async _deleteResourcesWithoutNamespace() {
        const kinds = Kinds.kindsWithoutNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Deleting ${kind} resources.`);
            try {
                await KubernetesResourceDeleter._deleteResources(this._resourcePathsGroupedByKind[kind], kind, (resource) => {
                    return this._kubernetesCoreClient[kind.toLowerCase()].delete(resource.metadata.name);
                });
            }
            catch (error) {
                console.error(`Unable to delete ${kind} resources.`);
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
    async _deleteResourcesWithNamespace() {
        const kinds = Kinds.kindsWithNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Deleting ${kind} resources.`);
            try {
                await KubernetesResourceDeleter._deleteResources(this._resourcePathsGroupedByKind[kind], kind, (resource) => {
                    return this._kubernetesApiClient.group(resource).namespaces.kind(resource).delete(resource.metadata.name);
                });
            }
            catch (error) {
                console.error(`Unable to delete ${kind} resources.`);
                console.error("Reason:", error);
            }
        }

        return Promise.resolve();
    }

    static async _deleteResources(resourcePaths, kind, deleteFunction) {
        for (let index = 0; index < resourcePaths.length; index++) {
            const resourcePath = resourcePaths[index];
            const resource = JSON.parse(fs.readFileSync(resourcePath));
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

module.exports = KubernetesResourceDeleter;
const KubernetesClient = require('kubernetes-client');
const KubernetesResourceGatherer = require('./resourcegatherer');
const Kinds = require('./kinds');
const fs = require('fs-extra');

class KubernetesResourceCreator {
    constructor(namespace) {
        this._namespace = namespace;
        this._doNotCreateKinds = [];
        this._gatherer = new KubernetesResourceGatherer(this._namespace);
        this._kubernetesCoreClient = new KubernetesClient.Core({
            url: 'http://localhost:8001', //TODO: Might want to make this an option.
            version: 'v1',
            namespace: namespace,
            promises: true
        });

        this._kubernetesApiClient = new KubernetesClient.Api({
            url: 'http://localhost:8001',
            promises: true,
            namespace: namespace
        });

    }

    doNotCreateKind(kind) {
        this._gatherer.doNotGather(kind);
    }

    async createResourcesFoundInDirectoryTree(path) {
        try {
            this._resourcePathsGroupedByKind = await this._gatherer.gatherResourcePathsFoundInDirectoryTreeGroupedByKind(path);
            await this._createAll();
        }
        catch (e) {
            console.error(e);
        }
    }

    async _createAll() {
        try {
            await this._createResourcesWithoutNamespace();
            await this._createResourcesWithNamespace();
            return Promise.resolve();
        }
        catch (e) {
            console.error(e);
        }
    }

    async _createResourcesWithoutNamespace() {
        const kinds = Kinds.kindsWithoutNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Creating ${kind} resources.`);
            try {
                await KubernetesResourceCreator._createResources(this._resourcePathsGroupedByKind[kind], kind, (resource) => {
                    return this._kubernetesCoreClient[kind.toLowerCase()].post({body: resource});
                });
            }
            catch (error) {
                console.error(`Unable to create ${kind} resources.`);
                console.error("Reason:", error);
            }
        }
        return Promise.resolve();
    }

    async _createResourcesWithNamespace() {
        const kinds = Kinds.kindsWithNamespace();
        for (let index = 0; index < kinds.length; index++) {
            const kind = kinds[index];
            console.info(`Creating ${kind} resources.`);
            try {
                const resourcePaths = this._resourcePathsGroupedByKind[kind];
                if (kind === Kinds.deployment && resourcePaths.length > 0) {
                    await this._checkPersistentVolumeClaimsStatusIsBound()
                }
                await KubernetesResourceCreator._createResources(resourcePaths, kind, (resource) => {
                    return this._kubernetesApiClient.group(resource).namespaces.kind(resource).post({body: resource});
                });
            }
            catch (error) {
                console.error(`Unable to create ${kind} resources.`);
                console.error("Reason:", error);
            }
        }
        return Promise.resolve();
    }

    async _checkPersistentVolumeClaimsStatusIsBound() {
        console.info("Checking if PersistentVolumeClaims have been bound.");
        const persistentVolumeClaimPaths = this._resourcePathsGroupedByKind[Kinds.persistentVolumeClaim];
        for (let index = 0; index < persistentVolumeClaimPaths.length; index++) {
            try {
                const persistentVolumeClaim = JSON.parse(fs.readFileSync(persistentVolumeClaimPaths[index]));
                console.info('Checking claim:', persistentVolumeClaim.metadata.name);
                await this._requestPersistentVolumeClaimWithRetry(persistentVolumeClaim);
            }
            catch (e) {
                console.error(e);
            }
        }

        return Promise.resolve();
    }

    async _requestPersistentVolumeClaimWithRetry(persistentVolumeClaim) {
        const MAX_RETRIES = 10;
        for (let i = 0; i <= MAX_RETRIES; i++) {
            try {
                const response = await this._kubernetesCoreClient.namespaces.persistentvolumeclaims.get(persistentVolumeClaim.metadata.name);
                if (response && KubernetesResourceCreator._claimIsBound(response)) {
                    console.info(`Claim ${persistentVolumeClaim.metadata.name}: Has been bound.`);
                    return Promise.resolve(response);
                }

            } catch (err) {
                console.error(err);
                const timeout = Math.pow(2, i);
                console.log('...Waiting:', timeout, 'ms');
                setTimeout(() => {
                }, timeout);
                console.log('...Retrying');
            }
        }
        return Promise.reject(`Binding for "${persistentVolumeClaim.metadata.name}" could not be found.`);
    }

    static _claimIsBound(response) {
        return response && response.status && response.status.phase && response.status.phase === "Bound";
    }

    static async _createResources(resourcePaths, kind, createFunction) {
        for (let index = 0; index < resourcePaths.length; index++) {
            const resourcePath = resourcePaths[index];
            const resource = JSON.parse(fs.readFileSync(resourcePath));
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

module.exports = KubernetesResourceCreator;
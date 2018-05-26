import * as fs from 'fs-extra'
import * as KubernetesClient from 'kubernetes-client'
import KubernetesResourceGatherer from './resourcegatherer';
import * as Kinds from '../kinds/kinds'
import IKind from "../kinds/ikind";
import PersistentVolumeClaim from "../kinds/namespaced/persistentvolumeclaim";
import {kindIsWorkload} from "../kinds/kinds";
import CrudResource from "./crud/crud-resource";

export default class KubernetesResourceCreator {
    private namespace: string;
    private doNotCreateKinds: any[];
    private gatherer: KubernetesResourceGatherer;
    private resourcePathsGroupedByKind: any;
    private client: any;

    constructor(namespace: string, context: string) {
        this.namespace = namespace;
        this.doNotCreateKinds = [];
        this.gatherer = new KubernetesResourceGatherer();

        const Client = KubernetesClient.Client;
        const config = KubernetesClient.config;
        this.client = new Client({
            config: config.fromKubeconfig(undefined, context),
            version: '1.8'
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
                    const crudResource = new CrudResource(resource, kind);
                    return crudResource.post(this.client);
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
                if (kindIsWorkload(kind.toString()) && resourcePaths.length > 0) {
                    await this.checkPersistentVolumeClaimsStatusIsBound()
                }
                await KubernetesResourceCreator.createResources(resourcePaths, kind.toString(), (resource: any) => {
                    const crudresource = new CrudResource(resource, kind);
                    return crudresource.post(this.client);
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
        const persistentVolumeClaimPaths = this.resourcePathsGroupedByKind[new PersistentVolumeClaim().toString()];
        if (persistentVolumeClaimPaths) {
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
        }
        return Promise.resolve();
    }

    private async requestPersistentVolumeClaimWithRetry(persistentVolumeClaim: any) {
        const MAX_RETRIES = 10;
        for (let i = 0; i <= MAX_RETRIES; i++) {
            try {
                const resource = new CrudResource(persistentVolumeClaim, new PersistentVolumeClaim());
                const response = await resource.get(this.client, undefined);
                if (response && KubernetesResourceCreator.claimIsBound(response.body)) {
                    console.info(`Claim ${persistentVolumeClaim.metadata.name}: Has been bound.`);
                    return Promise.resolve(response);
                }
                else {
                    await this.retry(i, undefined);
                }

            } catch (err) {
                await this.retry(i, err);
            }
        }
        return Promise.reject(`Binding for "${persistentVolumeClaim.metadata.name}" could not be found.`);
    }

    retry(retries: number, error: string) {
        return new Promise(((resolve) => {
            if (error) {
                console.error(error);
            }
            const timeout = Math.pow(100, retries);
            console.log('Waiting:', timeout, 'ms');
            setTimeout(() => {
                resolve()
            }, timeout);
            console.log('Retrying');
        }))
    }


    static claimIsBound(responseBody: any) {
        return responseBody && responseBody.status && responseBody.status.phase && responseBody.status.phase === "Bound";
    }

    static async createResources(resourcePaths: any, kind: string, createFunction: Function) {
        for (let index = 0; index < resourcePaths.length; index++) {
            const resourcePath = resourcePaths[index];
            const resource = JSON.parse(fs.readFileSync(resourcePath).toString());
            try {
                await
                    createFunction(resource);
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
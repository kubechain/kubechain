import * as fs from 'fs-extra';
import * as Path from 'path';
import * as globby from 'globby';
import * as Kinds from '../kinds/kinds';


export default class KubernetesResourceGatherer {
    private namespace: string;
    private doNotCreateKinds: string[];
    private resourcesPathsGroupedByKind: any;

    constructor(namespace: string) {
        this.namespace = namespace;
        this.doNotCreateKinds = [];
        this.resourcesPathsGroupedByKind = this.initializeResourcepathGroups();
    }

    private initializeResourcepathGroups() {
        const resourcesPathsGroupedByKind: any = {};
        Kinds.asStrings().forEach((kind: string) => {
            resourcesPathsGroupedByKind[kind] = [];
        });

        return resourcesPathsGroupedByKind;
    }

    //TODO: Change paramater type to IKind
    doNotGather(kind: string) {
        this.doNotCreateKinds.push(kind);
    }

    gatherResourcePathsFoundInDirectoryTreeGroupedByKind(path: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const paths = await globby([Path.join(path, '**', '*.json')]);
                paths.forEach((path: string) => {
                    const contents = fs.readFileSync(path, 'utf8');
                    try {
                        const json = JSON.parse(contents);
                        this.groupResourcePathByKind(json.kind, path);
                    }
                    catch (e) {
                        console.error("File does not contain valid JSON.", "File-path:", path);
                        reject(e);
                    }
                });
                resolve(this.resourcesPathsGroupedByKind)
            }
            catch (e) {
                reject(e);
            }
        })
    }

    gatherResourcePathsFoundInDirectoryGroupedByKind(path: string) {
        return new Promise(async (resolve, reject) => {
            try {
                const paths = await globby([Path.join(path, '*.json')]);
                paths.forEach((path: string) => {
                    const contents = fs.readFileSync(path, 'utf8');
                    try {
                        const json = JSON.parse(contents);
                        this.groupResourcePathByKind(json.kind, path);
                    }
                    catch (e) {
                        console.error("File does not contain valid JSON.", "File-path:", path);
                        reject(e);
                    }
                });
                resolve(this.resourcesPathsGroupedByKind)
            }
            catch (e) {
                reject(e);
            }
        })
    }

    groupResourcePathByKind(resourceKind: string, resourcePath: string) {
        if (this.shouldGather(resourceKind)) {
            this.resourcesPathsGroupedByKind[resourceKind].push(resourcePath);
        }
        else {
            console.warn("Unable to match found resource kind to supported kinds.", resourceKind);
        }
    }

    shouldGather(kind: string) {
        return (!(kind in this.doNotCreateKinds) && Kinds.isKind(kind));
    }
}
const fs = require('fs-extra');
const Path = require('path');
const globby = require('globby');
const Kinds = require('./kinds');

class KubernetesResourceGatherer {
    constructor(namespace) {
        this._namespace = namespace;
        this._doNotCreateKinds = [];
        this._resourcesPathsGroupedByKind = this._initializeResourcepathGroups();
    }

    _initializeResourcepathGroups() {
        const resourcesPathsGroupedByKind = {};
        Kinds.asStrings().forEach(kind => {
            resourcesPathsGroupedByKind[kind] = [];
        });

        return resourcesPathsGroupedByKind;
    }

    doNotGather(kind) {
        this._doNotCreateKinds.push(kind);
    }

    gatherResourcePathsFoundInDirectoryTreeGroupedByKind(path) {
        return new Promise(async (resolve, reject) => {
            try {
                const paths = await globby([Path.join(path, '**', '*.json')]);
                paths.forEach(path => {
                    const contents = fs.readFileSync(path, 'utf8');
                    try {
                        const json = JSON.parse(contents);
                        this._groupResourcePathByKind(json.kind, path);
                    }
                    catch (e) {
                        console.error("File does not contain valid JSON.", "File-path:", path);
                        reject(e);
                    }
                });
                resolve(this._resourcesPathsGroupedByKind)
            }
            catch (e) {
                reject(e);
            }
        })
    }

    gatherResourcePathsFoundInDirectoryGroupedByKind(path) {
        return new Promise(async (resolve, reject) => {
            try {
                const paths = await globby([Path.join(path, '*.json')]);
                paths.forEach(path => {
                    const contents = fs.readFileSync(path, 'utf8');
                    try {
                        const json = JSON.parse(contents);
                        this._groupResourcePathByKind(json.kind, path);
                    }
                    catch (e) {
                        console.error("File does not contain valid JSON.", "File-path:", path);
                        reject(e);
                    }
                });
                resolve(this._resourcesPathsGroupedByKind)
            }
            catch (e) {
                reject(e);
            }
        })
    }

    _groupResourcePathByKind(resourceKind, resourcePath) {
        if (this._shouldGather(resourceKind)) {
            this._resourcesPathsGroupedByKind[resourceKind].push(resourcePath);
        }
        else {
            console.warn("Unable to match found resource kind to supported kinds.", resourceKind);
        }
    }

    _shouldGather(kind) {
        return (!(kind in this._doNotCreateKinds) && Kinds.isKind(kind));
    }
}

module.exports = KubernetesResourceGatherer;
import ConfigMapTuple from "./configmaptuple";

export default class ConfigMapTuples {
    private rootPath: string;
    private tuples: ConfigMapTuple[];

    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.tuples = [];
    }

    add(configMapTuple: ConfigMapTuple) {
        this.tuples.push(configMapTuple);
    }

    findTuplesForRelativePath(path: string): ConfigMapTuple[] {
        const tuples: ConfigMapTuple[] = [];
        this.tuples.forEach((tuple: ConfigMapTuple) => {
            if (tuple.relativePathMatches(path)) {
                tuples.push(tuple);
            }
        });
        return tuples;
    }

    findSubPathTuplesForRelativePath(path: string): ConfigMapTuple[] {
        const tuples: ConfigMapTuple[] = [];
        this.tuples.forEach((tuple: ConfigMapTuple) => {
            if (tuple.relativePathMatches(path) || tuple.relativeSubPathMatches(path)) {
                tuples.push(tuple);
            }
        });
        return tuples;
    }

    findForAbsolutePath(path: string): ConfigMapTuple[] {
        const tuples: ConfigMapTuple[] = [];
        this.tuples.forEach((tuple: ConfigMapTuple) => {
            if (tuple.absolutePathMatches(path)) {
                tuples.push(tuple);
            }
        });
        return tuples;
    }
}
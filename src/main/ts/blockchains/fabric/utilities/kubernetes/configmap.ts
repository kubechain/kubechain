import * as Path from 'path';
import {directoryToConfigMap} from "../../../../kubernetes-sdk/utilities/1.8/configuration-storage/configuration/configmap";
import {parseDirectoryTree} from "../../../../util";
import ConfigMapTuples from "./configmaptuples";
import ConfigMapTuple from "./configmaptuple";
import {namespacedUuid} from "../../../../kubernetes-sdk/utilities/naming";
import * as uuidv5 from "uuid/v5";

function directoryTreeToConfigMapTuples(rootPath: string, namespace: string): ConfigMapTuples {
    const tuples = new ConfigMapTuples(rootPath);
    parseDirectoryTree(rootPath, rootPath, (nodePath: string) => {

        const relativepathToRootPath = Path.relative(rootPath, nodePath) || Path.basename(rootPath);
        const name = relativepathToRootPath.replace(new RegExp('\\' + Path.sep, 'g'), '-');
        const configMap = directoryToConfigMap(nodePath, namespacedUuid(name, namespace), namespace);
        if (configMap) {
            tuples.add(new ConfigMapTuple(nodePath, relativepathToRootPath, configMap));
        }
    });

    return tuples;
}

export {directoryTreeToConfigMapTuples}
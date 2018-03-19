import * as fs from 'fs-extra';
import * as Path from 'path';
import * as uuidv5 from 'uuid/v5'
import ConfigMap from '../../../../api/1.8/configuration-storage/configuration/configmap/configmap';
import * as Util from "../../../../../util";
import KeyToPath from '../../../../api/1.8/configuration-storage/storage/volumes/volumesources/keytopath';
import * as Naming from '../../../naming';
import ConfigMapTuples from "../../../../../blockchains/fabric/utilities/kubernetes/configmaptuples";
import ConfigMapTuple from "../../../../../blockchains/fabric/utilities/kubernetes/configmaptuple";

function directoryTreeToConfigMaps(rootPath: string, namespace: string): any {
    const configMaps: any = {};
    Util.parseDirectoryTree(rootPath, rootPath, (nodePath: string) => {
        const nodePathRelativeToRootPath = Path.relative(rootPath, nodePath) || Path.basename(rootPath);
        const name = nodePathRelativeToRootPath.replace(new RegExp('\\' + Path.sep, 'g'), '-');
        const configMap = directoryToConfigMap(nodePath, uuidv5(name, namespace), namespace);
        if (configMap) {
            configMaps[nodePathRelativeToRootPath] = configMap;
        }
    });
    return configMaps;
}

//TODO: Handle directories with no files in them.
function directoryToConfigMap(path: string, name: string, namespace: string): ConfigMap {
    let configMap = new ConfigMap(name, namespace);
    const files = Util.findFilesInDirectory(path);
    if (files && files.length > 0) {
        files.forEach(path => {
            fileToDataPair(configMap, path)
        });
    }
    else {
        // throw new Error('Unable to create ConfigMap. Directory contains no files.');
        configMap = null; //TODO: Don't return null.
    }

    return configMap;
}

function fileToDataPair(configMap: ConfigMap, path: string) {
    const fileName = Path.basename(path);
    const key = Naming.fileNameToPosixFileName(fileName);
    configMap.addDataPair(key, fs.readFileSync(path).toString());
    configMap.addItem(new KeyToPath(key, fileName));
}

export {directoryToConfigMap, directoryTreeToConfigMaps}
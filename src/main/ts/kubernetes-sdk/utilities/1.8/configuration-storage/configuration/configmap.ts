import fs = require('fs-extra');
import Path = require('path');
import ConfigMap from '../../../../api/1.8/configuration-storage/configuration/configmap/configmap';
import Util =  require('../../../../../../js/util');
import KeyToPath from '../../../../api/1.8/configuration-storage/storage/volumes/volumesources/keytopath';
import * as Naming from '../../../naming';

function createFromPath(path: string, name: string, namespace: string): ConfigMap {
    const configMap = new ConfigMap(name, namespace);
    const files = Util.findFilesInDirectory(path);
    files.forEach(path => {
        fileToDataPair(configMap, path)
    });
    return configMap;
}

function fileToDataPair(configMap: ConfigMap, path: string) {
    const fileName = Path.basename(path);
    const key = Naming.fileNameToPosixFileName(fileName);
    configMap.addDataPair(key, fs.readFileSync(path).toString());
    configMap.addItem(new KeyToPath(key, fileName));
}

export {createFromPath}
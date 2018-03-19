import * as Path from "path";
import * as fs from "fs-extra";
import OpaqueSecret from "../../../../api/1.8/configuration-storage/configuration/secret/opaquesecret";
import {findFilesInDirectory} from "../../../../../util";
import ISecret from "../../../../api/1.8/configuration-storage/configuration/secret/isecret";
import {fileNameToPosixFileName} from "../../../naming";
import KeyToPath from "../../../../api/1.8/configuration-storage/storage/volumes/volumesources/keytopath";

function directoryToOpaqueSecret(path: string, name: string, namespace: string): OpaqueSecret {
    const opaqueSecret = new OpaqueSecret(name, namespace);
    const files = findFilesInDirectory(path);
    if (files && files.length > 0) {
        files.forEach(path => {
            fileToDataPair(opaqueSecret, path)
        });
    }
    else {
        throw new Error('Unable to create ConfigMap. Directory contains no files. ');
    }

    return opaqueSecret;
}

function fileToDataPair(configMap: ISecret, path: string) {
    const fileName = Path.basename(path);
    const key = fileNameToPosixFileName(fileName);
    configMap.addDataPair(key, fs.readFileSync(path));
    configMap.addItem(new KeyToPath(key, fileName));
}

export {directoryToOpaqueSecret}
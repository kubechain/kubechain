import Path = require('path');
import uuidv5 = require('uuid/v5');

/**
 * @desc Kubernetes only accepts posix paths.
 * @param path
 * @returns {string}
 */
function pathToPosixPath(path: string) {
    let posixPath = "";
    path.split(Path.sep).forEach(node => {
        posixPath = Path.posix.join(posixPath, node);
    });

    return posixPath;
}

/**
 * @desc Kubernetes only accepts POSIX fully portable filenames.
 * @param {string} fileName
 * @return {string}
 */
function fileNameToPosixFileName(fileName: string) {
    return fileName.replace(/[^-._a-zA-Z0-9]+/, '-');
}

/**
 * @desc Kubernetes only allows DNS1123 naming. As well as throwing an error for names longer than 63 characters.
 *       UUIDv5 outputs a maximum of 36 characters and allows name + namespace combinations. This fits Kubernetes
 *       naming perfectly.
 * @param {string} name
 * @param {string} namespace
 * @returns {string}
 * @private
 */
function namespacedUuid(name: string, namespace: string) {
    const uuidNamespace = uuidv5(namespace, uuidv5.DNS);
    const uuid = uuidv5(name, uuidNamespace);
    return toDNS1123(uuid);
}

function toDNS1123(string: string) {
    return string.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function fullyQualifiedDomainName(hostname: string, serviceName: string, namespace: string) {
    return `${toDNS1123(hostname)}.${toDNS1123(serviceName)}.${toDNS1123(namespace)}.svc.cluster.local`;
}


export {
    pathToPosixPath,
    fileNameToPosixFileName,
    namespacedUuid,
    toDNS1123,
    fullyQualifiedDomainName
};
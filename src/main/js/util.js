const shell = require('shelljs');
const fs = require('fs-extra');
const Path = require('path');

function findShellDependencies(dependencies) {
    let found = {};
    dependencies.map(dependency => {
        found[dependency] = !!(shell.which(dependency));
    });
    return found;
}

function capitalize(string) {
    return string.toLowerCase().replace(/\b./g, function (a) {
        return a.toUpperCase();
    });
}

/**
 * @param {Array} directories
 */
function createDirectories(directories) {
    directories.map(createDirectory)
}

function createDirectory(path) {
    fs.mkdirsSync(path);
}

function findFilesInDirectory(directoryPath) {
    return findInDirectoryTree(directoryPath, (filePath) => {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    })
}

function findDirectoriesInDirectory(directoryPath) {
    return findInDirectoryTree(directoryPath, (filePath) => {
        const stats = fs.statSync(filePath);
        return stats.isDirectory();
    })
}

function findInDirectoryTree(directoryPath, premise) {
    const vertices = [];
    fs.readdirSync(directoryPath).map(fileName => {
        const filePath = Path.join(directoryPath, fileName);
        if (premise(filePath)) {
            vertices.push(filePath);
        }
    });
    return vertices;
}

function parseDirectoryTreeDepthFirst(rootPath, nodePath, callbackFunc) {
    callbackFunc(nodePath);
    findDirectoriesInDirectory(nodePath).map(directory => {
        parseDirectoryTreeDepthFirst(rootPath, directory, callbackFunc);
    });
}

function toJsonFile(path, fileName, contents) {
    fs.outputFileSync(Path.join(path, fileName + ".json"), JSON.stringify(contents, null, 4), {
        encoding: 'utf8',
        flag: 'w'
    });
}

module.exports = {
    findShellDependencies,
    capitalize,
    createDirectories,
    findFilesInDirectory,
    toJsonFile,
    parseDirectoryTree: parseDirectoryTreeDepthFirst
};
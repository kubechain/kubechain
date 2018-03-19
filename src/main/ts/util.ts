import * as shell from 'shelljs';
import * as fs from 'fs-extra';
import * as Path from 'path';

function findShellDependencies(dependencies: string[]) {
    let found: any = {};
    dependencies.map(dependency => {
        found[dependency] = !!(shell.which(dependency));
    });
    return found;
}

function capitalize(string: string) {
    return string.toLowerCase().replace(/\b./g, function (a) {
        return a.toUpperCase();
    });
}

/**
 * @param {Array} directories
 */
function createDirectories(directories: string[]) {
    directories.map(createDirectory)
}

function createDirectory(path: string) {
    fs.mkdirsSync(path);
}

function findFilesInDirectory(directoryPath: string) {
    return findInDirectoryTree(directoryPath, (filePath: string) => {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    })
}

function findDirectoriesInDirectory(directoryPath: string) {
    return findInDirectoryTree(directoryPath, (filePath: string) => {
        const stats = fs.statSync(filePath);
        return stats.isDirectory();
    })
}

function findInDirectoryTree(directoryPath: string, premise: Function) {
    const vertices: string[] = [];
    fs.readdirSync(directoryPath).map((fileName: string) => {
        const filePath = Path.join(directoryPath, fileName);
        if (premise(filePath)) {
            vertices.push(filePath);
        }
    });
    return vertices;
}

function parseDirectoryTreeDepthFirst(rootPath: string, nodePath: string, callbackFunc: Function) {
    callbackFunc(nodePath);
    findDirectoriesInDirectory(nodePath).map(directory => {
        parseDirectoryTreeDepthFirst(rootPath, directory, callbackFunc);
    });
}

function toJsonFile(path: string, fileName: string, contents: any) {
    fs.outputFileSync(Path.join(path, fileName + ".json"), JSON.stringify(contents, null, 4), {
        encoding: 'utf8',
        flag: 'w'
    });
}

const parseDirectoryTree = parseDirectoryTreeDepthFirst;

export {
    findShellDependencies,
    capitalize,
    createDirectories,
    findFilesInDirectory,
    toJsonFile,
    parseDirectoryTree
}
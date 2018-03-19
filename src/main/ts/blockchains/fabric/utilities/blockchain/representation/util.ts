import * as fs from 'fs-extra';

function findSkFileInDirectory(path: string) {
    return findFileNameInDirectory(path, "_sk");
}

function findPemFileInDirectory(path: string) {
    return findFileNameInDirectory(path, ".pem");
}

function findFileNameInDirectory(path: string, searchTerm: string) {
    let fileName = "";
    fs.readdirSync(path).map((file: string) => {
        if (file.endsWith(searchTerm)) {
            fileName = file;
        }
    });
    return fileName;
}

export {findSkFileInDirectory, findPemFileInDirectory};
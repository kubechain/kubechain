const fs = require('fs-extra');

function findSkFileInDirectory(path) {
    return findFileNameInDirectory(path, "_sk");
}

function findPemFileInDirectory(path) {
    return findFileNameInDirectory(path, ".pem");
}

function findFileNameInDirectory(path, searchTerm) {
    let fileName = "";
    fs.readdirSync(path).map(file => {
        if (file.endsWith(searchTerm)) {
            fileName = file;
        }
    });
    return fileName;
}

module.exports = {findSkFileInDirectory, findPemFileInDirectory};
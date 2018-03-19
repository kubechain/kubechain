import * as Util from './util';

export default class FilePaths {
    private filePaths: any;

    constructor() {
        this.filePaths = {};
    }

    addPemFile(key: string, path: string) {
        this.add(key, Util.findPemFileInDirectory(path));
    }

    addSkFile(key: string, path: string) {
        this.add(key, Util.findSkFileInDirectory(path));
    }

    add(key: string, path: string) {
        this.filePaths[key] = path;
    }

    toJson() {
        return this.filePaths;
    }
}
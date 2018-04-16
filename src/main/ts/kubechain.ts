import KubechainTargets from "./targets";

const path = require('path');
const jsonpath = require('jsonpath');

interface KubechainOptions {
    targets: KubechainTargets
    paths: {
        root: string
        configuration: string
        blockchains: string
        kubernetes: string
    }
}

export default class Kubechain {
    private options: KubechainOptions;

    constructor(targets: KubechainTargets) {
        this.options = Kubechain._defaults();
        if (targets) {
            this.options.targets = targets;
        }
    }

    static _defaults(): KubechainOptions {
        const cwd = process.cwd();
        return {
            targets: {
                blockchain: {
                    name: ""
                },
                kubernetes: {
                    name: ""
                }
            },
            paths: {
                root: cwd,
                configuration: path.join(cwd, 'configuration'),
                blockchains: path.join(cwd, 'blockchains'),
                kubernetes: path.join(cwd, 'kubernetes')
            }
        };
    }

    get(jsonPath: string) {
        return jsonpath.value(this.options, jsonPath)
    }

    getAll(jsonPath: string) {
        return jsonpath.query(this.options, jsonPath)
    }

    getOptions() {
        return this.options;
    }
}
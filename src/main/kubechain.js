const path = require('path');
const jsonpath = require('jsonpath');

class Kubechain {
    constructor(options) {
        this._setOptions(options || {});
    }

    _setOptions(options) {
        this._options = Object.assign(options, Kubechain._defaults());
    }

    static _defaults() {
        const cwd = process.cwd();
        return {
            target: {
                blockchain: {
                    name: "fabric",
                },
                kubernetes: {
                    host: "minikube"
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

    get(jsonPath) {
        return jsonpath.value(this._options, jsonPath)
    }

    getAll(jsonPath) {
        return jsonpath.query(this._options, jsonPath)
    }

    getOptions() {
        return this._options;
    }
}

module.exports = Kubechain;
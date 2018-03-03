const jsonpath = require('jsonpath');
const Path = require('path');
const Kubechain = require('../../kubechain');

class Options {
    constructor(kubechain) {
        this._kubechain = kubechain || new Kubechain();
        this._options = Object.assign(this._kubechain.get(`$.blockchains[?(@name=="${Options.name()}")]`) || {}, this._defaults());
    }

    static name() {
        return 'burrow';
    }

    _defaults() {
        const configurationRoot = Path.join(this._kubechain.get('$.paths.configuration'), Options.name());
        const nodesRoot = Path.join(configurationRoot, 'accounts');
        const blockchainRoot = Path.join(this._kubechain.get('$.paths.blockchains'), Options.name());
        const intermediateRoot = Path.join(blockchainRoot, 'intermediate');
        const kubernetesRoot = Path.join(this._kubechain.get('$.paths.kubernetes'), Options.name());
        return {
            name: 'burrow',
            version: '0.17.0',
            configuration: {
                paths: {
                    root: configurationRoot,
                },
                accounts: {
                    paths: {
                        root: nodesRoot,
                        accountsJson: Path.join(nodesRoot, 'accounts.json')
                    }
                }
            },
            blockchain: {
                paths: {
                    root: blockchainRoot,
                },
                intermediate: {
                    paths: {
                        root: intermediateRoot,
                        accounts: Path.join(intermediateRoot, 'accounts'),
                        configuration: Path.join(intermediateRoot, 'configuration')
                    }
                }
            },
            kubernetes: {
                paths: {
                    root: kubernetesRoot,
                    accounts: Path.join(kubernetesRoot, 'accounts'),
                    seeds: Path.join(kubernetesRoot, 'seeds'),
                    peers: Path.join(kubernetesRoot, 'peers')
                }
            }
        }
    }

    get(jsonPath) {
        return jsonpath.value(this._options, jsonPath);
    }

    getAll(jsonPath) {
        return jsonpath.query(this._options, jsonPath);
    }
}

module.exports = Options;
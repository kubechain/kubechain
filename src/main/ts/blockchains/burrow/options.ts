import Kubechain from "../../kubechain";

const jsonpath = require('jsonpath');
const Path = require('path');


interface BurrowOptions {
    name: string
    version: string,
    configuration: {
        paths: {
            root: string,
        },
        accounts: {
            paths: {
                root: string,
                accountsJson: string
            }
        }
    },
    blockchain: {
        paths: {
            root: string
        },
        intermediate: {
            paths: {
                root: string,
                accounts: string,
                configuration: string
            }
        }
    },
    kubernetes: {
        paths: {
            root: string,
            seeds: string,
            peers: string
        }
    }
}

export default class Options {
    private kubechain: Kubechain;
    private options: BurrowOptions;

    constructor(kubechain: Kubechain) {
        this.kubechain = kubechain;
        this.options = this.defaults();
    }

    private name(): string {
        return `${this.kubechain.get('$.targets.blockchain.name')}-${this.kubechain.get('$.targets.kubernetes.name')}`;
    }

    private defaults(): BurrowOptions {
        const configurationRoot = Path.join(this.kubechain.get('$.paths.configuration'), this.kubechain.get('$.targets.blockchain.name'));
        const accountsRoot = Path.join(configurationRoot, 'accounts');
        const blockchainRoot = Path.join(this.kubechain.get('$.paths.blockchains'), this.kubechain.get('$.targets.blockchain.name'));
        const intermediateRoot = Path.join(blockchainRoot, 'intermediate');
        const kubernetesRoot = Path.join(this.kubechain.get('$.paths.kubernetes'), this.name());
        return {
            name: this.name(),
            version: '0.17.0',
            configuration: {
                paths: {
                    root: configurationRoot,
                },
                accounts: {
                    paths: {
                        root: accountsRoot,
                        accountsJson: Path.join(accountsRoot, 'accounts.json')
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
                    seeds: Path.join(kubernetesRoot, 'seeds'),
                    peers: Path.join(kubernetesRoot, 'peers')
                }
            }
        }
    }

    get(jsonPath: string): any {
        return jsonpath.value(this.options, jsonPath);
    }

    getAll(jsonPath: string): [any] {
        return jsonpath.query(this.options, jsonPath);
    }
}
import Kubechain from "../../kubechain/kubechain";
import IHooks from "../utilities/iadapterhooks";
import IWorkloadHooks from "../utilities/iworkloadhooks";

const jsonpath = require('jsonpath');
const Path = require('path');


interface BurrowOptions {
    name: string
    version: string,
    hooks: IHooks
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
        nodes: {
            amount: number
            peers: {
                amount: number
            }
            seeds: {
                amount: number
            }
        }
    },
    kubernetes: {
        paths: {
            root: string,
            seeds: string,
            peers: string
        }
        workloads: any
    }
}

export default class Options {
    private kubechain: Kubechain;
    private options: BurrowOptions;

    constructor(kubechain: Kubechain) {
        this.kubechain = kubechain;
        this.options = this.defaults();
    }

    private defaults(): BurrowOptions {
        const configurationRoot = Path.join(this.kubechain.get('$.paths.configuration'), this.kubechain.get('$.targets.blockchain'));
        const accountsRoot = Path.join(configurationRoot, 'accounts');
        const blockchainRoot = Path.join(this.kubechain.get('$.paths.blockchains'), this.kubechain.get('$.targets.blockchain'));
        const intermediateRoot = Path.join(blockchainRoot, 'intermediate');
        const kubernetesRoot = Path.join(this.kubechain.get('$.paths.kubernetes'), this.kubechain.get('$.name'));
        return {
            name: this.kubechain.get('$.name'),
            version: '0.17.0',
            hooks: this.kubechain.get('$.adapter.hooks') || {

                loadedConfiguration(data: any): void {
                },

                createdRepresentations(data: any): void {
                },

                createdWorkloads(data: any): void {
                },

                beforeWrite(data: any): void {
                },

                written(data: any): void {
                },

                workload: {
                    created(data: any): void {
                    },

                    createdConfiguration(data: any): void {
                    },

                    beforeCreate(data: any): void {
                    },

                    beforeWrite(data: any): void {
                    }
                }
            },
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
                },
                nodes: {
                    amount: undefined,
                    peers: {
                        amount: undefined
                    },
                    seeds: {
                        amount: 1
                    }
                }
            },
            kubernetes: {
                paths: {
                    root: kubernetesRoot,
                    seeds: Path.join(kubernetesRoot, 'seeds'),
                    peers: Path.join(kubernetesRoot, 'peers')
                },
                workloads: this.kubechain.get('$.adapter.kubernetes.workloads') || {}
            }
        }
    }

    get(jsonPath: string): any {
        return jsonpath.value(this.options, jsonPath);
    }
}
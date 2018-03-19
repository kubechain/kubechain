import * as jsonpath from 'jsonpath';
import * as Path from 'path';

import Kubechain from "../../kubechain";

interface FabricOptions {
    version: string
    configuration: {
        paths: {
            root: string
            configtx: string
            cryptoconfig: string
        }
    },
    blockchain: {
        paths: {
            root: string
            bin: string
            channels: string
        },
        organizations: {
            paths: {
                root: string
                peerorganizations: string
                ordererorganizations: string
            }
        },
    },
    kubernetes: {
        paths: {
            root: string
            peerorganizations: string
            ordererorganizations: string
        }
    }
}


export default class Options {
    private kubechain: Kubechain;
    private options: FabricOptions;

    constructor(kubechain: Kubechain) {
        this.kubechain = kubechain || new Kubechain();
        this.options = this.defaults();
    }

    private defaults(): FabricOptions {
        const configurationRoot = Path.join(this.kubechain.get('$.paths.configuration'), 'fabric');
        const blockchainRoot = Path.join(this.kubechain.get('$.paths.blockchains'), 'fabric');
        const organizationsRoot = Path.join(blockchainRoot, 'crypto-config');
        const kubernetesRoot = Path.join(this.kubechain.get('$.paths.kubernetes'), 'fabric');
        return {
            version: '1.0.4',
            configuration: {
                paths: {
                    root: configurationRoot,
                    configtx: Path.join(configurationRoot, 'configtx.yaml'),
                    cryptoconfig: Path.join(configurationRoot, 'crypto-config.yaml')
                }
            },
            blockchain: {
                paths: {
                    root: blockchainRoot,
                    bin: Path.join(blockchainRoot, 'bin'),
                    channels: Path.join(blockchainRoot, 'channels'),
                },
                organizations: {
                    paths: {
                        root: organizationsRoot,
                        peerorganizations: Path.join(organizationsRoot, 'peerOrganizations'),
                        ordererorganizations: Path.join(organizationsRoot, 'ordererOrganizations')
                    }
                },
            },
            kubernetes: {
                paths: {
                    root: kubernetesRoot,
                    peerorganizations: Path.join(kubernetesRoot, 'peerOrganizations'),
                    ordererorganizations: Path.join(kubernetesRoot, 'ordererOrganizations')
                }
            }
        }
    }

    get(jsonPath: string): any {
        return jsonpath.value(this.options, jsonPath);
    }

    getAll(jsonPath: string): any {
        return jsonpath.query(this.options, jsonPath);
    }
}
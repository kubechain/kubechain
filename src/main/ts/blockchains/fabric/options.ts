import * as jsonpath from 'jsonpath';
import * as Path from 'path';

import Kubechain from "../../kubechain/kubechain";
import KubechainTargets from "../../kubechain/targets";
import IChannel from "./utilities/blockchain/channel/options";
import IChainCode from "./utilities/blockchain/chaincode/options";
import FabricHooks from "./utilities/blockchain/hooks";


interface FabricOptions {
    name: string
    version: string
    hooks: FabricHooks
    options: {
        channels: IChannel[]
        chaincodes: IChainCode[]
    }
    configuration: {
        paths: {
            root: string
            configtx: string
            cryptoconfig: string
            chaincodes: string
        }
    },
    blockchain: {
        paths: {
            root: string
            bin: string
            channels: string
            chaincodes: string
        }
        configuration: {
            paths: {
                configtx: string
                cryptoconfig: string
            }
        }
        organizations: {
            paths: {
                root: string
                peerorganizations: string
                ordererorganizations: string
            }
        }
    },
    kubernetes: {
        paths: {
            root: string
            peerorganizations: string
            ordererorganizations: string
            chaincodes: string
            postlaunch: string
        }
    }
}


export default class Options {
    private kubechain: Kubechain;
    private options: FabricOptions;

    constructor(kubechain: Kubechain) {
        this.kubechain = kubechain || new Kubechain(new KubechainTargets({
            blockchain: 'fabric',
            kubernetes: 'minikube'
        }));
        this.options = this.defaults();
    }

    private defaults(): FabricOptions {
        const configurationRoot = Path.join(this.kubechain.get('$.paths.configuration'), this.kubechain.get('$.targets.blockchain'));
        const blockchainRoot = Path.join(this.kubechain.get('$.paths.blockchains'), this.kubechain.get('$.targets.blockchain'));
        const organizationsRoot = Path.join(blockchainRoot, 'crypto-config');
        const kubernetesRoot = Path.join(this.kubechain.get('$.paths.kubernetes'), this.kubechain.get('$.name'));
        return {
            name: this.kubechain.get('$.name'),
            version: this.kubechain.get('$.adapter.version') || '1.0.0',
            hooks: this.kubechain.get('$.adapter.hooks') || {
                creatingOrganization(data): void {

                },
                createdCryptographicMaterial(data: any): void {
                },

                createdChannels(data: any): void {
                },

                createdRepresentations(data: any): void {
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
            options: this.kubechain.get('$.adapter.options') || {chaincodes: [], channels: []},
            configuration: {
                paths: {
                    root: configurationRoot,
                    configtx: Path.join(configurationRoot, 'configtx.yaml'),
                    cryptoconfig: Path.join(configurationRoot, 'crypto-config.yaml'),
                    chaincodes: Path.join(configurationRoot, 'chaincodes')
                }
            },
            blockchain: {
                paths: {
                    root: blockchainRoot,
                    bin: Path.join(blockchainRoot, 'bin'),
                    channels: Path.join(blockchainRoot, 'channels'),
                    chaincodes: Path.join(blockchainRoot, 'chaincodes')
                },
                configuration: {
                    paths: {
                        configtx: Path.join(blockchainRoot, 'configtx.yaml'),
                        cryptoconfig: Path.join(blockchainRoot, 'crypto-config.yaml')
                    }
                },
                organizations: {
                    paths: {
                        root: organizationsRoot,
                        peerorganizations: Path.join(organizationsRoot, 'peerOrganizations'),
                        ordererorganizations: Path.join(organizationsRoot, 'ordererOrganizations')
                    }
                }
            },
            kubernetes: {
                paths: {
                    root: kubernetesRoot,
                    peerorganizations: Path.join(kubernetesRoot, 'peerOrganizations'),
                    ordererorganizations: Path.join(kubernetesRoot, 'ordererOrganizations'),
                    chaincodes: Path.join(kubernetesRoot, 'chaincodes'),
                    postlaunch: Path.join(kubernetesRoot, 'post-launch')
                }
            }
        }
    }

    get(jsonPath: string): any {
        return jsonpath.value(this.options, jsonPath);
    }
}
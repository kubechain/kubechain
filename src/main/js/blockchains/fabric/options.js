const jsonpath = require('jsonpath');
const Path = require('path');
const Kubechain = require('../../kubechain');

class FabricOptions {
    constructor(kubechain) {
        this._kubechain = kubechain || new Kubechain();
        this._options = Object.assign(this._kubechain.get(`$.blockchains[?(@name=="fabric")]`) || {}, this._defaults());
    }

    _defaults() {
        const configurationRoot = Path.join(this._kubechain.get('$.paths.configuration'), 'fabric');
        const blockchainRoot = Path.join(this._kubechain.get('$.paths.blockchains'), 'fabric');
        const organizationsRoot = Path.join(blockchainRoot, 'crypto-config');
        const kubernetesRoot = Path.join(this._kubechain.get('$.paths.kubernetes'), 'fabric');
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
                    intermediate: Path.join(blockchainRoot, 'intermediate')
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

    get(jsonPath) {
        return jsonpath.value(this._options, jsonPath);
    }

    getAll(jsonPath) {
        return jsonpath.query(this._options, jsonPath);
    }
}

module.exports = FabricOptions;
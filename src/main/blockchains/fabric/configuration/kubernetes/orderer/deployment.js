const Path = require('path');
const Deployment = require('../../../../../kubernetes-sdk/resourceobjects/controllers/deployment');

class OrdererDeployment {
    constructor(orderer, organization, organizationName, ordererID, fabricOptions) {
        this._organization = organization;
        this._fabricOptions = fabricOptions;
        this._orderer = orderer;
        this._podName = this._orderer.id() + "-" + this._organization.name();
        this._localMSPID = organization.mspID();
        this._funnelVolumeMounts = [];
        this._hyperledgerVolumeMounts = [];
        this._volumes = [];

        this._createVolumeConfiguration();

        this._deployment = new Deployment(this._podName, organizationName);
        this._deployment.addLabel("app", "hyperledger");
        this._deployment.addLabel("role", "orderer");
        this._deployment.addLabel("org", organizationName);
        this._deployment.addLabel("orderer-id", ordererID);
        this._deployment.addInitContainer({
            "name": "funnel",
            "image": "robertdiebels/funnel",
            volumeMounts: this._funnelVolumeMounts
        });
        this._deployment.addContainer({
            "name": this._podName,
            "image": `hyperledger/fabric-orderer:x86_64-${this._fabricOptions.get('$.version')}`,
            "env": [{
                "name": "ORDERER_GENERAL_LOGLEVEL",
                "value": "debug"
            }, {
                "name": "ORDERER_GENERAL_LISTENADDRESS",
                "value": "0.0.0.0"
            }, {
                "name": "ORDERER_GENERAL_GENESISMETHOD",
                "value": "file"
            }, {
                "name": "ORDERER_GENERAL_GENESISFILE",
                "value": "/var/hyperledger/orderer/orderer.genesis.block"
            }, {
                "name": "ORDERER_GENERAL_LOCALMSPID",
                "value": this._localMSPID
            }, {
                "name": "ORDERER_GENERAL_LOCALMSPDIR",
                "value": "/var/hyperledger/orderer/msp"
            }, {
                "name": "ORDERER_GENERAL_TLS_ENABLED",
                "value": "false"
            }, {
                "name": "ORDERER_GENERAL_TLS_PRIVATEKEY",
                "value": "/var/hyperledger/orderer/tls/server.key"
            }, {
                "name": "ORDERER_GENERAL_TLS_CERTIFICATE",
                "value": "/var/hyperledger/orderer/tls/server.crt"
            }, {
                "name": "ORDERER_GENERAL_TLS_ROOTCAS",
                "value": "[/var/hyperledger/orderer/tls/ca.crt]"
            }],
            "workingDir": "/opt/gopath/src/github.com/hyperledger/fabric/peer",
            "ports": [{"containerPort": 7050}],
            "command": ["orderer"],
            "volumeMounts": this._hyperledgerVolumeMounts
        });

        this._addVolumes();
    }

    _createVolumeConfiguration() {
        this._volumes = [];
        const persistentVolumeClaim = this._organization.persistentVolumeClaim();
        this._createFunnelVolumeConfiguration(persistentVolumeClaim);
        this._createHyperledgerVolumeConfiguration(persistentVolumeClaim);
        this._volumes.push(persistentVolumeClaim.toVolume());
    }

    _createFunnelVolumeConfiguration(persistentVolume) {
        this._addFunnelFromVolumeMounts();
        this._addFunnelToVolumeMounts(persistentVolume);
    }

    _funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    _addFunnelFromVolumeMounts() {
        const pathToMatch = Path.join('orderers', this._orderer.name());
        const funnelFromMountPath = Path.posix.join(this._funnelBaseMountPath(), 'from');
        const volumeConfigMap = this._organization.findVolumesAndVolumeMountsFor(pathToMatch, funnelFromMountPath);
        this._funnelVolumeMounts = volumeConfigMap.volumeMounts;
        this._addOrdererGenesisBlockToFunnelVolumeMounts(funnelFromMountPath);
        volumeConfigMap.volumes.forEach(volume => {
            this._volumes.push(volume.toJSON());
        });
    }

    _addFunnelToVolumeMounts(persistentVolumeClaim) {
        const funnelToMountPath = Path.posix.join(this._funnelBaseMountPath(), 'to');
        this._funnelVolumeMounts.push(persistentVolumeClaim.toVolumeMount(Path.posix.join(funnelToMountPath, 'tls'), this._tlsPath()));
        this._funnelVolumeMounts.push(persistentVolumeClaim.toVolumeMount(Path.posix.join(funnelToMountPath, 'msp'), this._mspPath()));
        this._funnelVolumeMounts.push(persistentVolumeClaim.toVolumeMount(Path.posix.join(funnelToMountPath, 'genesis'), 'genesis'));
    }

    _addOrdererGenesisBlockToFunnelVolumeMounts(funnelFromMountPath) {
        const genesisBlockSecret = this._organization.genesisBlockSecret();
        const genesisBlockVolume = genesisBlockSecret.toVolume();
        this._volumes.push(genesisBlockVolume.toJSON());
        this._funnelVolumeMounts.push(genesisBlockVolume.toVolumeMount(Path.posix.join(funnelFromMountPath, 'genesis')));
    }

    _createHyperledgerVolumeConfiguration(persistentVolumeClaim) {
        const hyperledgerMountPath = Path.posix.join(Path.posix.sep, 'var', 'hyperledger', 'orderer');
        const tlsVolumeMount = persistentVolumeClaim.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'tls'), this._tlsPath());
        const mspVolumeMount = persistentVolumeClaim.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'msp'), this._mspPath());
        const genesisBlockVolumeMount = persistentVolumeClaim.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'orderer.genesis.block'), Path.posix.join('genesis', 'genesis.block'));
        this._hyperledgerVolumeMounts = [tlsVolumeMount, mspVolumeMount, genesisBlockVolumeMount];
    }

    _tlsPath() {
        return Path.posix.join('orderers', this._orderer.name(), 'tls');
    }

    _mspPath() {
        return Path.posix.join('orderers', this._orderer.name(), 'msp');
    }

    _addVolumes() {
        this._volumes.forEach(volume => {
            this._deployment.addVolume(volume);
        })
    }

    toJSONFile(outputPath) {
        this._deployment.toJSONFile(outputPath);
    }

}

module.exports = OrdererDeployment;
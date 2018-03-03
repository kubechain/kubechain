const Path = require('path');
const Deployment = require('../../../../../kubernetes-sdk/api/1.8/workloads/deployment');
const HostPathVolume = require('../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/hostpath');

class CommandLineInterfaceDeployment {
    //TODO: Fix this contructor, way to many parameters.
    constructor(organization, namespace, name, artifactsPersistentVolumeClaim, fabricOptions) {
        this._organization = organization;
        this._namespace = namespace;
        this._name = name;
        this._artifactsPersistentVolumeClaim = artifactsPersistentVolumeClaim;
        this._fabricOptions = fabricOptions;

        this._funnelVolumeMounts = [];
        this._hyperledgerVolumeMounts = [];

        this._createVolumeConfiguration();

        this._peerAddress = "peer0." + this._organization.name() + ":7051";
        this._mspid = this._organization.mspID();
        this._pod = new Deployment(this._name, this._namespace);
        this._pod.addLabel("app", "cli");
        this._pod.addInitContainer({
            "name": "funnel",
            "image": "robertdiebels/funnel",
            "volumeMounts": this._funnelVolumeMounts
        });
        this._pod.addContainer({
            "name": this._name,
            "image": `hyperledger/fabric-tools:x86_64-${this._fabricOptions.get('$.version')}`,
            "env": [{"name": "CORE_PEER_TLS_ENABLED", "value": "false"}, {
                "name": "CORE_VM_ENDPOINT",
                "value": "unix:///host/var/run/docker.sock"
            }, {"name": "GOPATH", "value": "/opt/gopath"}, {
                "name": "CORE_LOGGING_LEVEL",
                "value": "DEBUG"
            }, {
                "name": "CORE_PEER_ID",
                "value": this._name
            }, {
                "name": "CORE_PEER_ADDRESS",
                "value": this._peerAddress
            }, {
                "name": "CORE_PEER_LOCALMSPID",
                "value": this._mspid
            }, {
                "name": "CORE_PEER_MSPCONFIGPATH",
                "value": "/etc/hyperledger/fabric/msp"
            }],
            "workingDir": "/opt/gopath/src/github.com/hyperledger/fabric/peer",
            "command": ["/bin/bash", "-c", "--"],
            "args": ["while true; do sleep 30; done;"],
            "volumeMounts": this._hyperledgerVolumeMounts
        });

        this._addVolumes();
    }

    _createVolumeConfiguration() {
        this._volumes = [];
        this._runHostPathVolume = new HostPathVolume('run', Path.posix.join(Path.posix.sep, 'var', 'run'));
        const persistentVolume = this._organization.persistentVolumeClaim();
        this._createFunnelVolumeConfiguration(persistentVolume);
        this._createHyperledgerVolumeConfiguration(persistentVolume);
        this._volumes.push(this._organization.persistentVolumeClaim().toVolume());
        this._volumes.push(this._artifactsPersistentVolumeClaim.toVolume());
        this._volumes.push(this._runHostPathVolume.toJSON())
    }

    _createFunnelVolumeConfiguration(persistentVolume) {
        const funnelBasePath = Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
        const funnelFromMountPath = Path.posix.join(funnelBasePath, 'from');
        const funnelToMountPath = Path.posix.join(funnelBasePath, 'to');
        const pathToMatch = Path.join('users', `Admin@${this._organization.name()}`, 'msp');

        const funnelVolumeMap = this._organization.findVolumesAndVolumeMountsFor(pathToMatch, funnelFromMountPath);
        this._funnelVolumeMounts = funnelVolumeMap.volumeMounts;
        this._funnelVolumeMounts.push(persistentVolume.toVolumeMount(funnelToMountPath, this._mspPath()));
        funnelVolumeMap.volumes.map(volume => {
            this._volumes.push(volume.toJSON());
        });
    }

    _mspPath() {
        return Path.posix.join('users', `Admin@${this._organization.name()}`, 'msp');
    }

    _createHyperledgerVolumeConfiguration(persistentVolume) {
        const hyperLedgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric', 'msp');
        this._hyperledgerVolumeMounts.push(persistentVolume.toVolumeMount(hyperLedgerMountPath, this._mspPath()));
        //TODO: Check usage of channel-artifacts
        this._hyperledgerVolumeMounts.push(this._artifactsPersistentVolumeClaim.toVolumeMount("/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts"));
        this._hyperledgerVolumeMounts.push(this._runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep)));
    }

    _addVolumes() {
        this._volumes.forEach(volume => {
            this._pod.addVolume(volume);
        })
    }

    toJSONFile(outputPath) {
        this._pod.toJSONFile(outputPath);
    }
}

module.exports = CommandLineInterfaceDeployment;

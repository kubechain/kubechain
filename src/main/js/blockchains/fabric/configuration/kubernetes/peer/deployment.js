const Path = require('path');
const Deployment = require('../../../../../kubernetes-sdk/api/1.8/workloads/deployment');
const HostPathVolume = require('../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/hostpath');

class PeerDeployment {
    constructor(organization, peer, organizationName, name) {
        this._organization = organization;
        this._peer = peer;
        this._namespace = organizationName;
        this._podName = this._peer.id() + "-" + this._organization.name();
        this._peerID = this._peer.id();
        this._name = name;
        this._org = organizationName;
        this._corePeerID = this._peer.name();
        this._peerAddress = this._peer.name() + ":7051";
        this._peerGossip = this._peer.name() + ":7051";
        this._localMSPID = this._organization.mspID();
        this._funnelVolumeMounts = [];
        this._hyperledgerVolumeMounts = [];
        this._volumes = [];


        this._createVolumeConfiguration();

        this._pod = new Deployment(this._podName, this._namespace);
        this._pod.addLabel("app", "hyperledger");
        this._pod.addLabel("role", "peer");
        this._pod.addLabel("peer-id", this._peerID);
        this._pod.addLabel("org", this._org);
        this._pod.addInitContainer({
            "name": "funnel",
            "image": "robertdiebels/funnel",
            "volumeMounts": this._funnelVolumeMounts
        });
        this._pod.addContainer({
            "name": "couchdb",
            "image": "hyperledger/fabric-couchdb:x86_64-1.0.4",
            "ports": [{"containerPort": 5984}]
        });
        this._pod.addContainer({
            "name": this._podName,
            "image": "hyperledger/fabric-peer:x86_64-1.0.4",
            "env": [{
                "name": "CORE_LEDGER_STATE_STATEDATABASE",
                "value": "CouchDB"
            }, {
                "name": "CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS",
                "value": "localhost:5984"
            }, {
                "name": "CORE_VM_ENDPOINT",
                "value": "unix:///host/var/run/docker.sock"
            }, {
                "name": "CORE_LOGGING_LEVEL",
                "value": "DEBUG"
            }, {
                "name": "CORE_PEER_TLS_ENABLED",
                "value": "false"
            }, {
                "name": "CORE_PEER_GOSSIP_USELEADERELECTION",
                "value": "true"
            }, {
                "name": "CORE_PEER_GOSSIP_ORGLEADER",
                "value": "false"
            }, {
                "name": "CORE_PEER_PROFILE_ENABLED",
                "value": "true"
            }, {
                "name": "CORE_PEER_TLS_CERT_FILE",
                "value": "/etc/hyperledger/fabric/tls/server.crt"
            }, {
                "name": "CORE_PEER_TLS_KEY_FILE",
                "value": "/etc/hyperledger/fabric/tls/server.key"
            }, {
                "name": "CORE_PEER_TLS_ROOTCERT_FILE",
                "value": "/etc/hyperledger/fabric/tls/ca.crt"
            }, {
                "name": "CORE_PEER_ID",
                "value": this._corePeerID
            }, {
                "name": "CORE_PEER_ADDRESS",
                "value": this._peerAddress
            }, {
                "name": "CORE_PEER_GOSSIP_EXTERNALENDPOINT",
                "value": this._peerGossip
            }, {
                "name": "CORE_PEER_LOCALMSPID",
                "value": this._localMSPID
            }],
            "workingDir": "/opt/gopath/src/github.com/hyperledger/fabric/peer",
            "ports": [
                {"containerPort": 7051},
                {"containerPort": 7052},
                {"containerPort": 7053}],
            "command": ["/bin/bash", "-c", "--"],
            "args": ["sleep 5; peer node start"],
            "volumeMounts": this._hyperledgerVolumeMounts
        });
        this._addVolumes();
    }

    _createVolumeConfiguration() {
        const persistentVolumeClaim = this._organization.persistentVolumeClaim();
        this._runHostPathVolume = new HostPathVolume('run', Path.posix.join(Path.posix.sep, 'var', 'run'));
        this._createFunnelVolumeConfiguration(persistentVolumeClaim);
        this._createHyperledgerVolumeConfiguration(persistentVolumeClaim);
        this._volumes.push(persistentVolumeClaim.toVolume());
        this._volumes.push(this._runHostPathVolume.toJSON());
    }

    _createFunnelVolumeConfiguration(persistentVolumeClaim) {
        this._addFunnelFromVolumeMounts();
        this._addFunnelToVolumeMounts(persistentVolumeClaim);
    }

    static _funnelBaseMountPath() {
        return Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
    }

    _addFunnelFromVolumeMounts() {
        const funnelFromMountPath = Path.posix.join(PeerDeployment._funnelBaseMountPath(), 'from');
        const osPathToMatch = Path.join('peers', this._peer.name());
        const volumeConfig = this._organization.findVolumesAndVolumeMountsFor(osPathToMatch, funnelFromMountPath);
        this._funnelVolumeMounts = volumeConfig.volumeMounts;
        this._volumes = volumeConfig.volumes.map(volume => {
            return volume.toJSON();
        });

    }

    _addFunnelToVolumeMounts(persistentVolumeClaim) {
        const funnelToMountPath = Path.posix.join(PeerDeployment._funnelBaseMountPath(), 'to');
        this._funnelVolumeMounts.push(persistentVolumeClaim.toVolumeMount(Path.posix.join(funnelToMountPath, 'tls'), this._tlsPath()));
        this._funnelVolumeMounts.push(persistentVolumeClaim.toVolumeMount(Path.posix.join(funnelToMountPath, 'msp'), this._mspPath()))
    }

    _createHyperledgerVolumeConfiguration(persistentVolume) {
        const hyperledgerMountPath = Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric');
        const tlsVolumeMount = persistentVolume.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'tls'), this._tlsPath());
        const mspVolumeMount = persistentVolume.toVolumeMount(Path.posix.join(hyperledgerMountPath, 'msp'), this._mspPath());
        const runHostPathVolumeMount = this._runHostPathVolume.toVolumeMount(Path.posix.join(Path.posix.sep, 'host', 'var', 'run', Path.posix.sep));
        this._hyperledgerVolumeMounts.push(tlsVolumeMount);
        this._hyperledgerVolumeMounts.push(mspVolumeMount);
        this._hyperledgerVolumeMounts.push(runHostPathVolumeMount);
    }

    _tlsPath() {
        return Path.posix.join('peers', this._peer.name(), 'tls');
    }

    _mspPath() {
        return Path.posix.join('peers', this._peer.name(), 'msp');
    }

    _addVolumes() {
        this._volumes.forEach(volume => {
            this._pod.addVolume(volume);
        })
    }

    toJSONFile(outputPath) {
        return this._pod.toJSONFile(outputPath);

    }
}

module.exports = PeerDeployment;
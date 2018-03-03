const path = require('path');
const Util = require('../../../../../util');

const Organization = require('./organization');
const Peer = require('../peer/peer');

//TODO: Consider putting this in a package.
const ConfigMapGenerator = require('../../../../../kubernetes-sdk/api/1.8/configuration/configmapgenerator');
const PersistentHostPathVolume = require('../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/hostpathvolume');
const PersistentVolumeClaim = require('../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim');
const Namespace = require('../../../../../kubernetes-sdk/api/1.8/cluster/namespace');

const CertificateAuthority = require('../ca/ca');
const CommandLineInterface = require('../cli/cli');

class PeerOrganisation {
    constructor(fabricOptions, json) {
        this._options = fabricOptions;
        this._json = json;
        this._name = json.name;
        this._configPath = json.path;
        this._outputPaths = this._createOutputPaths();
        this._configDirectoryTreeToConfigMaps = ConfigMapGenerator.directoryTreeToConfigMaps(this._configPath, this.namespace());
    }

    _createOutputPaths() {
        const outputPath = path.join(this._options.get('$.kubernetes.paths.peerorganizations'), this._name);
        return {
            root: outputPath,
            peers: path.join(outputPath, 'peers'),
            configmaps: path.join(outputPath, 'configmaps')
        };
    }

    name() {
        return this._name;
    }

    namespace() {
        return this._name;
    }

    persistentVolumeClaim() {
        return this._persistentVolumeClaim;
    }

    addressSegment() {
        return Organization.addressSegment(this._name);
    }

    mspID() {
        return Util.capitalize(this._name.split('-')[0]) + "MSP";
    }

    configMaps() {
        return Object.values(this._configDirectoryTreeToConfigMaps);
    }

    directoriesToConfigMaps() {
        return this._configDirectoryTreeToConfigMaps;
    }

    createKubernetesResources() {
        console.info("[PEER-ORGANISATION]:", this._name);
        this._createOrganisationDirectories();
        this._createConfigMaps();
        this._createNamespace();
        this._createPersistentVolume();
        this._createCli();
        this._createCa();
        this._createPeers();
    }

    findVolumesAndVolumeMountsFor(relativePath, baseMountPath) {
        return Organization.findVolumesAndVolumeMounts(this, relativePath, baseMountPath);
    }

    _createOrganisationDirectories() {
        console.info("...Creating configuration directories");
        Util.createDirectories(Object.values(this._outputPaths));
    }

    _createConfigMaps() {
        console.info("...Creating configmaps");
        this.configMaps().forEach(configMap => {
            configMap.toJSONFile(this._outputPaths.configmaps);
        });
    }

    _createNamespace() {
        const outputPath = this._outputPaths.root;
        this._namespace = new Namespace(this._name);
        this._namespace.toJSONFile(outputPath);
    }

    _createPersistentVolume() {
        //TODO: PersistentHostPathVolume should be changed when creating configuration for AWS.
        this._persistentVolume = new PersistentHostPathVolume(this._name, Organization.minikubeSharedFolder(this._name), "50Mi", this._name);
        this._persistentVolume.toJSONFile(this._outputPaths.root);

        // TODO: Create function to create VolumeClaim from persistentVolume.
        // Reason: StorageClassName and AccessModes determine which persistentVolume a Claim uses.
        //         A Persistent Volume of type HostPath only allows ReadWritOnce access. Any Claim with ReadWriteMany will not use that Volume.
        this._persistentVolumeClaim = new PersistentVolumeClaim(this._name, this._name, {
            "accessModes": ["ReadWriteOnce"],
            "storageClassName": this._name,
            "resources": {
                "requests": {
                    "storage": "10Mi"
                }
            }
        });
        this._persistentVolumeClaim.toJSONFile(this._outputPaths.root);
    }

    _createCli() {
        const cli = new CommandLineInterface(this, this._name, this._options);
        cli.toKubernetesResource(this._outputPaths.root);
    }

    _createCa() {
        const ca = new CertificateAuthority(this, this._json.certificateAuthority, this._options);
        ca.toKubernetesResource(this._outputPaths.root);
    }

    _createPeers() {
        console.info("...Creating peers");
        this._json.entities.map(peerOptions => {
            const peer = new Peer(peerOptions, this);
            peer.toKubernetesResource(this._outputPaths.peers);
        });
    }

    static equalsType(type) {
        return type === 'peer';
    }
}

module.exports = PeerOrganisation;
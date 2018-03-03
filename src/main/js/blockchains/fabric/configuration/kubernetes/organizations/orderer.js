const path = require('path');
const Util = require('../../../../../util');

const Organization = require('./organization');
const Orderer = require('../orderer/orderer');

//TODO: Consider creating a package for this.
const ConfigMapGenerator = require('../../../../../kubernetes-sdk/api/1.8/configuration/configmapgenerator');
const Namespace = require('../../../../../kubernetes-sdk/api/1.8/cluster/namespace');
const PersistentHostPathVolume = require('../../../../../kubernetes-sdk/api/1.8/cluster/persistentvolumes/hostpath/hostpathvolume');
const PersistentVolumeClaim = require('../../../../../kubernetes-sdk/api/1.8/configuration-storage/storage/persistentvolumeclaim');
const Secret = require('../../../../../kubernetes-sdk/api/1.8/configuration/secret');

class OrdererOrganisation {
    constructor(options, json) {
        this._options = options;
        this._json = json;
        this._name = json.name;
        this._configPath = json.path;
        this._outputPaths = this._createOutputPaths();
        this._configDirectoryTreeToConfigMaps = ConfigMapGenerator.directoryTreeToConfigMaps(this._configPath, this.namespace());
        this._createPersistentVolume();
        this._createGenesisBlockSecret(this._configPath);

    }

    _createOutputPaths() {
        const outputPath = path.join(this._options.get('$.kubernetes.paths.ordererorganizations'), this._name);
        return {
            root: outputPath,
            orderers: path.join(outputPath, 'orderers'),
            configmaps: path.join(outputPath, 'configmaps')
        };
    }

    _createPersistentVolume() {
        //TODO: PersistentHostPathVolume should be changed when creating configuration for AWS.
        this._persistentVolume = new PersistentHostPathVolume(this._name, Organization.minikubeSharedFolder(this._name), "50Mi", this._name);
        this._persistentVolume.toJSONFile(this._outputPaths.root);
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

    _createGenesisBlockSecret(configPath) {
        this._genesisBlockSecret = new Secret(this._name + '-genesis-block', this._name);
        this._genesisBlockSecret.addFilesFromDirectory(configPath);
        this._genesisBlockSecret.toJSONFile(this._outputPaths.root);
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


    mspID() {
        return Util.capitalize(this._name.split('-')[0]) + "MSP";
    }

    addressSegment() {
        return Organization.addressSegment(this._name);
    }

    genesisBlockSecret() {
        return this._genesisBlockSecret
    }

    configMaps() {
        return Object.values(this._configDirectoryTreeToConfigMaps);
    }

    directoriesToConfigMaps() {
        return this._configDirectoryTreeToConfigMaps;
    }

    createKubernetesResources() {
        console.info('[ORDERER-ORGANISATION]:', this._name);
        this._createOutputDirectories();
        this._createConfigMaps();
        this._createNamespace();
        this._createOrderers();
    }

    _createNamespace() {
        this._namespace = new Namespace(this._name);
        this._namespace.toJSONFile(this._outputPaths.root);
    }


    findVolumesAndVolumeMountsFor(relativePath, baseMountPath) {
        return Organization.findVolumesAndVolumeMounts(this, relativePath, baseMountPath);
    }

    _createOutputDirectories() {
        console.info("...Creating configuration directories");
        Util.createDirectories(Object.values(this._outputPaths));
    }

    _createConfigMaps() {
        console.info("...Creating configmaps");
        this.configMaps().forEach(configMap => {
            configMap.toJSONFile(this._outputPaths.configmaps);
        })
    }

    _createOrderers() {
        console.info("...Creating orderers");
        this._json.entities.forEach(ordererOptions => {
            const orderer = new Orderer(ordererOptions, this, this._options);
            orderer.toKubernetesResource(this._outputPaths.orderers);
        });
    }

    static equalsType(type) {
        return type === 'orderer';
    }
}

module.exports = OrdererOrganisation;
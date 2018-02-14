const Path = require('path');
const CliDeployment = require('./deployment');
const PersistentHostPathVolume = require('../../../../../kubernetes-sdk/resourceobjects/storage/persistent/hostpathvolume');
const PersistentVolumeClaim = require('../../../../../kubernetes-sdk/resourceobjects/storage/persistentvolumeclaim');

class CommandLineInterFace {
    constructor(organization, organizationName, fabricOptions) {
        this._fabricOptions = fabricOptions;
        //TODO: Check how and when artifacts are filled.
        this._artifactsPersistentVolume = new PersistentHostPathVolume(organizationName + "-artifacts", Path.posix.join(Path.posix.sep, 'data', 'artifacts', organizationName), '50Mi', organizationName + "-artifacts");
        //TODO: Check accessModes
        this._artifactsPersistentVolumeClaim = new PersistentVolumeClaim(organizationName + "-artifacts", organizationName,
            {
                "accessModes": ["ReadWriteOnce"],
                "storageClassname": organizationName + "-artifacts",
                "resources": {
                    "requests": {
                        "storage": "10Mi"
                    }
                }
            });

        this._deployment = new CliDeployment(organization, organizationName, "cli", this._artifactsPersistentVolumeClaim, this._fabricOptions);
    }

    toKubernetesResource(outputPath) {
        this._artifactsPersistentVolume.toJSONFile(Path.join(outputPath));
        this._artifactsPersistentVolumeClaim.toJSONFile(outputPath);
        this._deployment.toJSONFile(outputPath);
    }
}

module.exports = CommandLineInterFace;
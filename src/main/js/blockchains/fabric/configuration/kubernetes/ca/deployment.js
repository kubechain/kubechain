const Path = require('path');
const Deployment = require('../../../../../kubernetes-sdk/api/1.8/workloads/deployment');

class CertificateAuthorityDeployment {
    constructor(organization, options, fabricOptions) {
        this._organization = organization;
        this._options = options;
        this._fabricOptions = fabricOptions;
        this._namespace = organization.namespace();
        this._funnelVolumeMounts = [];
        this._hyperledgerVolumeMounts = [];
        this._volumes = [];

        this._createVolumeConfiguration();

        const organizationName = organization.name();
        const name = "ca";
        const caCertFile = Path.posix.join(CertificateAuthorityDeployment.hyperledgerMountPath(), options.filePaths.certificate);
        const caKeyFile = Path.posix.join(CertificateAuthorityDeployment.hyperledgerMountPath(), options.filePaths.privateKey);

        this._pod = new Deployment(name, organizationName);
        this._pod.addLabel("app", "hyperledger");
        this._pod.addLabel("role", name);
        this._pod.addLabel("org", organizationName);
        this._pod.addLabel("name", name);
        this._pod.addInitContainer({
            "name": "funnel",
            "image": "robertdiebels/funnel",
            "volumeMounts": this._funnelVolumeMounts
        });
        this._pod.addContainer({
            "name": name,
            "image": `hyperledger/fabric-ca:x86_64-${this._fabricOptions.get('$.version')}`,
            "env": [{
                "name": "FABRIC_CA_HOME",
                "value": "/etc/hyperledger/fabric-ca-server"
            }, {
                "name": "FABRIC_CA_SERVER_CA_NAME",
                "value": "ca"
            }, {
                "name": "FABRIC_CA_SERVER_TLS_ENABLED",
                "value": "false"
            }, {
                "name": "FABRIC_CA_SERVER_TLS_CERTFILE",
                "value": caCertFile
            }, {
                "name": "FABRIC_CA_SERVER_TLS_KEYFILE",
                "value": caKeyFile
            }
            ],
            "ports": [{"containerPort": 7054}
            ],
            "command": ["sh"],
            "args": ["-c", ` fabric-ca-server start --ca.certfile ${caCertFile} --ca.keyfile ${caKeyFile} -b admin:adminpw -d `],
            "volumeMounts": this._hyperledgerVolumeMounts
        });

        this._addVolumes();
    }

    static hyperledgerMountPath() {
        return Path.posix.join(Path.posix.sep, 'etc', 'hyperledger', 'fabric-ca-server-config');
    }

    static caPath() {
        return Path.posix.join('ca', Path.posix.sep);
    }

    _createVolumeConfiguration() {
        this._volumes = [];
        const persistentVolume = this._organization.persistentVolumeClaim();
        this._createFunnelVolumeConfiguration(persistentVolume);
        this._createHyperledgerVolumeConfiguration(persistentVolume);
        this._volumes.push(persistentVolume.toVolume())
    }

    _createFunnelVolumeConfiguration(persistentVolume) {
        const funnelBasePath = Path.posix.join(Path.posix.sep, 'usr', 'src', 'app');
        const funnelFromMountPath = Path.posix.join(funnelBasePath, 'from');
        const funnelToMountPath = Path.posix.join(funnelBasePath, 'to');

        const configMap = this._organization.directoriesToConfigMaps()['ca'];
        const configMapVolume = configMap.toVolume();
        this._funnelVolumeMounts = [
            configMapVolume.toVolumeMount(funnelFromMountPath),
            persistentVolume.toVolumeMount(funnelToMountPath, CertificateAuthorityDeployment.caPath())
        ];
        this._volumes.push(configMapVolume.toJSON())
    }

    _createHyperledgerVolumeConfiguration(persistentVolume) {
        this._hyperledgerVolumeMounts = [persistentVolume.toVolumeMount(CertificateAuthorityDeployment.hyperledgerMountPath(), CertificateAuthorityDeployment.caPath())];
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

module.exports = CertificateAuthorityDeployment;
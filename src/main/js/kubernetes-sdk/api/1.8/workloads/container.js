const Naming = require('../../../utilities/naming');

class Container {
    constructor(name, image) {
        this._name = Naming.toDNS1123(name);
        this._image = image;
        this._ports = [];
        this._volumeMounts = [];
        this._environment = [];
        this._commands = [];
    }

    addPort(port) {
        this._ports.push(port);
    }

    addVolumeMount(volumeMount) {
        this._volumeMounts.push(volumeMount);
    }

    addEnvironmentVariable(name, value) {
        this._environment.push({"name": name, "value": value});
    }

    addCommand(command) {
        this._commands.push(command);
    }

    setSecurityContext(context) {
        this._securityContext = context;
    }

    toJSON() {
        return {
            "name": this._name,
            "image": this._image,
            "imagePullPolicy": "Always",
            "securityContext": this._securityContext,
            "command": this._commands,
            "ports": this._ports,
            "env": this._environment,
            "volumeMounts": this._volumeMounts
        }
    }
}

module.exports = Container;
const Platform = require('../../../../../targets/minikube/host/platforms/platform');

//TODO: Not happy with this implementation. Move to Typescript.
class SupportedPlatform extends Platform {
    isHostArchitectureSupported() {
    }
}

module.exports = SupportedPlatform;
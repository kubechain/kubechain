class PodSpec {
    constructor() {
        this._containers = [];
        this._initContainers = [];
        this._volumes = [];
    }

    setHostname(hostname) {
        this._hostname = hostname;
    }

    setSubdomain(subDomain) {
        this.domain = subDomain;
    }

    setRestartPolicy(restartPolicy) {
        this._restartPolicy = restartPolicy;
    }

    addInitContainer(container) {
        this._initContainers.push(container);
    }

    addContainer(container) {
        this._containers.push(container)
    }

    addVolume(volume) {
        this._volumes.push(volume);
    }

    toJSON() {
        return {
            "hostname": this._hostname,
            "subdomain": this.domain,
            "restartPolicy": this._restartPolicy,
            "initContainers": this._initContainers,
            "containers": this._containers,
            "volumes": this._volumes
        };
    }
}

module.exports = PodSpec;
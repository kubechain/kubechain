import IContainer from "./icontainer";
import EnvVar from "./envvar";
import VolumeMount from "./volumemount";
import ContainerPort from "./port";

export default class Container implements IContainer {
    private name: string;
    private image: string;
    private imagePullPolicy: string;
    private commands: string[];
    private securityContext: {};
    private environment: EnvVar[];
    private ports: ContainerPort[];
    private volumeMounts: VolumeMount[];

    constructor(name: string, image: string) {
        this.name = name;
        this.image = image;
        this.imagePullPolicy = "IfNotPresent";
        this.ports = [];
        this.volumeMounts = [];
        this.environment = [];
        this.commands = [];
    }

    addPort(port: ContainerPort) {
        this.ports.push(port);
    }

    addVolumeMount(volumeMount: VolumeMount) {
        this.volumeMounts.push(volumeMount);
    }

    addEnvironmentVariable(envVar: EnvVar) {
        this.environment.push(envVar);
    }

    addCommand(command: string) {
        this.commands.push(command);
    }

    //TODO: Create actual type
    setSecurityContext(context: {}) {
        this.securityContext = context;
    }

    toJson() {
        return {
            "name": this.name,
            "image": this.image,
            "imagePullPolicy": this.imagePullPolicy,
            "securityContext": this.securityContext,
            "command": this.commands,
            "ports": this.ports.map(port => {
                return port.toJson();
            }),
            "env": this.environment.map(envVar => {
                return envVar.toJson();
            }),
            "volumeMounts": this.volumeMounts.map(volumeMount => {
                return volumeMount.toJson();
            })
        }
    }
}
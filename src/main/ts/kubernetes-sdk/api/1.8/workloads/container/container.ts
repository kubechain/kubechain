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
    private args: string[];
    private workingDirectory: string;

    constructor(name: string, image: string) {
        this.name = name;
        this.image = image;
        this.imagePullPolicy = "IfNotPresent";
        this.ports = [];
        this.volumeMounts = [];
        this.environment = [];
        this.commands = [];
        this.args = [];
    }

    setImagePullPolicy(policy: string) {
        this.imagePullPolicy = policy;
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

    addArgument(argument: string) {
        this.args.push(argument);
    }

    setSecurityContext(context: {}) {
        this.securityContext = context;
    }

    setWorkingDirectory(directoryPath: string) {
        this.workingDirectory = directoryPath;
    }

    toJson() {
        return {
            "name": this.name,
            "image": this.image,
            "imagePullPolicy": this.imagePullPolicy,
            "securityContext": this.securityContext,
            "command": this.commands,
            "args": this.args,
            "ports": this.ports.map(port => {
                return port.toJson();
            }),
            "env": this.environment.map(envVar => {
                return envVar.toJson();
            }),
            "volumeMounts": this.volumeMounts.map(volumeMount => {
                return volumeMount.toJson();
            }),
            "workingDir": this.workingDirectory
        }
    }
}
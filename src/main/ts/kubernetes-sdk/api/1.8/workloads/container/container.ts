import IContainer from "./icontainer";
import EnvVar from "./envvar";
import VolumeMount from "./volumemount";
import ContainerPort from "./port";
import SecurityContext from "./securitycontext";
import ResourceRequirements from "../../meta/resourcerequirements";

export default class Container implements IContainer {
    private name: string;
    private image: string;
    private imagePullPolicy: string;
    private commands: string[];
    private securityContext: SecurityContext;
    private environment: EnvVar[];
    private ports: ContainerPort[];
    private volumeMounts: VolumeMount[];
    private args: string[];
    private workingDirectory: string;
    private resources: ResourceRequirements;

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

    setSecurityContext(context: SecurityContext) {
        this.securityContext = context;
    }

    setWorkingDirectory(directoryPath: string) {
        this.workingDirectory = directoryPath;
    }

    setResourceRequirements(resources: ResourceRequirements) {
        this.resources = resources;
    }

    toJson() {
        return {
            "name": this.name,
            "image": this.image,
            "imagePullPolicy": this.imagePullPolicy,
            "securityContext": (this.securityContext) ? this.securityContext.toJson() : undefined,
            "command": (this.commands && this.commands.length > 0) ? this.commands : undefined,
            "args": (this.args && this.args.length > 0) ? this.args : undefined,
            "ports": this.ports.map(port => {
                return port.toJson();
            }),
            "env": this.environment.map(envVar => {
                return envVar.toJson();
            }),
            "volumeMounts": this.volumeMounts.map(volumeMount => {
                return volumeMount.toJson();
            }),
            "resources": (this.resources) ? this.resources.toJson() : undefined,
            "workingDir": this.workingDirectory
        }
    }
}
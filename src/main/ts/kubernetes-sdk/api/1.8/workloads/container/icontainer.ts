import IResource from "../../iresource";
import VolumeMount from "./volumemount";
import ContainerPort from "./port";
import EnvVar from "./envvar";

export default interface IContainer extends IResource {
    setImagePullPolicy(policy: string): void;

    addPort(port: ContainerPort): void;

    addVolumeMount(volumeMount: VolumeMount): void;

    addEnvironmentVariable(envVar: EnvVar): void;

    addCommand(command: string): void;

    addArgument(argument: string): void;

    setSecurityContext(context: {}): void;

    setWorkingDirectory(directoryPath: string): void;
}
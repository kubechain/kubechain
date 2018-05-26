import ResourceWriter from "./resourcewriter/resourcewriter";
import IContainer from "../../../../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import ConfigurationDirectory from "../kubernetes/files/configurationdirectory";
import IPodSpec from "../../../../kubernetes-sdk/api/1.8/workloads/pod/ipodspec";
import IConfigurationResource from "../../../../kubernetes-sdk/api/1.8/configuration-storage/configuration/iconfigurationresource";

export default class ConfigurationCollector<T extends IConfigurationResource> {
    private directories: ConfigurationDirectory<T>[];

    constructor(directories: ConfigurationDirectory<T>[]) {
        this.directories = directories;
    }

    mount(container: IContainer, mountPath: string) {
        this.directories.forEach((directory: ConfigurationDirectory<T>) => {
            directory.mountWithRelativePath(container, mountPath);
        });
    }

    addAsVolume(spec: IPodSpec) {
        this.directories.forEach((directoy: ConfigurationDirectory<T>) => {
            directoy.addAsVolume(spec);
        });
    }

    addToWriter(writer: ResourceWriter, path: string) {
        this.directories.forEach((sourceCodeFile: ConfigurationDirectory<T>) => {
            const resource = sourceCodeFile.getDirectoryResource();
            const json = resource.toJson();
            const name = json.metadata.name; //TODO: Change this. Ok for now.
            writer.addResource({
                path: path,
                name: name,
                resource: resource
            });
        });
    }
}
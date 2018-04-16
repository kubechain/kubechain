import Options from "../../../../../options";
import CommandLineInterfaceDeployment from "./deployment";
import PeerOrganization from "../../peer";


export default class CommandLineInterFace {
    private options: Options;
    private deployment: CommandLineInterfaceDeployment;
    private organization: PeerOrganization;

    constructor(organization: PeerOrganization, organizationName: string, options: Options) {
        this.organization = organization;
        this.options = options;
        this.deployment = new CommandLineInterfaceDeployment(organization, this.options);
    }

    toKubernetesResource(outputPath: string) {
        this.deployment.toKubernetesResource(outputPath);
    }
}
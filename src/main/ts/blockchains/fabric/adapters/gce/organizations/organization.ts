import * as Path from 'path';
import IOrganization from './iorganization';
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import Options from "../../../options";
import * as Util from "../../../../../util";

export default class Organization implements IOrganization {
    private representation: OrganizationRepresentation;

    constructor(representation: OrganizationRepresentation, options: Options) {
        this.representation = representation;
    }

    name(): string {
        return this.representation.name;
    }

    namespace(): string {
        return this.representation.name;
    }

    mspID(): string {
        return Util.capitalize(this.representation.name.split('-')[0]) + "MSP";
    }

    addressSegment() {
        const gap = 100;
        //Original source uses a number in the organizations' domain spec as the addressSegment.
        //This is based on name of the organizations. Should a user choose not to use org1 or org2 as names the code will break.
        //TODO: If this code is to be published and used this should be altered.
        return (parseInt(this.representation.name.split("-")[0].split("org")[1])) * gap;
    }


    minikubeSharedFolder(): string {
        return Path.posix.join(Path.posix.sep, 'data', '.kubechain', 'fabric', this.representation.name);
    }
}


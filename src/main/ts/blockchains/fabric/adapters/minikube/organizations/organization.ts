import * as Path from 'path';
import IOrganization from './iorganization';
import OrganizationRepresentation from "../../../utilities/blockchain/representation/organizations/representation";
import {toDNS1123} from "../../../../../kubernetes-sdk/utilities/naming";

//TODO: Duplicate removal
export default class Organization implements IOrganization {
    private representation: OrganizationRepresentation;

    constructor(representation: OrganizationRepresentation) {
        this.representation = representation;
    }

    name(): string {
        return toDNS1123(this.representation.name);
    }

    namespace(): string {
        return this.representation.domain;
    }

    mspID(): string {
        return this.representation.mspId;
    }

    minikubeSharedFolder(): string {
        return Path.posix.join(Path.posix.sep, 'data', '.kubechain', 'fabric', this.representation.name);
    }
}


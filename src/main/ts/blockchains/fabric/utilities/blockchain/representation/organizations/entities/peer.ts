import OrganizationEntity from "./entity";
import IEntity from "./ientity";
import OrganizationEntityRepresentation from "./representation";

export default class Peer implements IEntity {
    private entity: OrganizationEntity;

    constructor(name: string, path: string) {
        this.entity = new OrganizationEntity(name, path, 'peer');
    }

    toJson(): OrganizationEntityRepresentation {
        return this.entity.toJson();
    }
}
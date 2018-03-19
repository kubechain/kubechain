import OrganizationEntity from "./entity";
import IEntity from "./ientity";
import OrganizationEntityRepresentation from "./representation";

export default class Orderer implements IEntity {
    private entity: OrganizationEntity;

    constructor(name: string, path: string) {
        this.entity = new OrganizationEntity(name, path, 'orderer');
    }

    toJson(): OrganizationEntityRepresentation {
        return this.entity.toJson();
    }
}
import * as  Path from 'path';
import EntityMembershipServiceProvider from "../../membershipserviceproviders/entitymembershipserviceprovider";
import Tls from "../../certificateauthorities/tls/tls";
import IUser from "./iuser";
import UserRepresentation from "./representation";

export default class User implements IUser {
    private name: string;
    private path: string;
    private type: string;
    private membershipServiceProvider: EntityMembershipServiceProvider;
    private tls: Tls;

    constructor(name: string, path: string, type: string) {
        this.name = name;
        this.path = path;
        this.type = type;
        this.membershipServiceProvider = new EntityMembershipServiceProvider(name, Path.join(path, 'msp'));
        this.tls = new Tls(name, path);
    }

    toJson(): UserRepresentation {
        return {
            "name": this.name,
            "path": this.path,
            "type": this.type,
            "membershipServiceProvider": this.membershipServiceProvider.toJson(),
            "tls": this.tls.toJson()
        }
    }
}
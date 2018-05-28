import * as fs from 'fs-extra';
import * as Path from 'path';
import CertificateAuthority from "../certificateauthorities/ca/certificateauthority";
import MembershipServiceProvider from "../membershipserviceproviders/membershipserviceprovider";
import TlsCertificateAuthority from "../certificateauthorities/tlsca/tlscertificateauthority";
import RegularUser from "./users/regular";
import AdminUser from "./users/admin";
import IUser from "./users/iuser";
import IOrganization from "./iorganization";
import IEntity from "./entities/ientity";
import OrganizationRepresentation from "./representation";
import UserRepresentation from "./users/representation";
import OrganizationEntityRepresentation from "./entities/representation";

export default class Organization implements IOrganization {
    private name: string;
    private path: string;
    private type: string;
    private domain: string;
    private mspId: string;
    private certificateAuthority: CertificateAuthority;
    private membershipServiceProvider: MembershipServiceProvider;
    private tlsCertificateAuthority: TlsCertificateAuthority;
    private users: IUser[];
    private entities: any[];

    constructor(name: string, path: string, type: string, domain: string, mspId: string) {
        this.name = name;
        this.path = path;
        this.type = type;
        this.domain = domain;
        this.mspId = mspId;
        this.certificateAuthority = new CertificateAuthority(name, Path.join(path, 'ca'));
        this.membershipServiceProvider = new MembershipServiceProvider(mspId, Path.join(path, 'msp'));
        this.tlsCertificateAuthority = new TlsCertificateAuthority(name, Path.join(path, 'tlsca'));
        this.users = [];
        this.entities = [];
        this.addUsers();
    }

    private addUsers() {
        const usersPath = Path.join(this.path, 'users');
        fs.readdirSync(usersPath).forEach(userName => {
            const path = Path.join(usersPath, userName);
            let user: IUser = new RegularUser(userName, path);
            const match = userName.toLowerCase().match('admin');
            if (match && match.length > 0) {
                user = new AdminUser(userName, path);
            }
            this.addUser(user);
        });
    }

    addUser(user: IUser) {
        this.users.push(user);
    }

    addEntity(entity: IEntity) {
        this.entities.push(entity);
    }

    toJson(): OrganizationRepresentation {
        return {
            name: this.name,
            type: this.type,
            path: this.path,
            domain: this.domain,
            mspId: this.mspId,
            certificateAuthority: this.certificateAuthority.toJson(),
            membershipServiceProvider: this.membershipServiceProvider.toJson(),
            tlsCertificateAuthority: this.tlsCertificateAuthority.toJson(),
            users: this.usersToJSON(),
            entities: this.entitiesToJSON()
        }
    }

    private usersToJSON(): UserRepresentation[] {
        return this.users.map(user => {
            return user.toJson();
        })
    }

    private entitiesToJSON(): OrganizationEntityRepresentation[] {
        return this.entities.map(entity => {
            return entity.toJson()
        })
    }
}
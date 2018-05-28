import * as  Path from 'path';
import * as YamlJs from "yamljs";
import Kubechain from "../../../../../kubechain/kubechain";
import Options from '../../../options';
import OrdererOrganization from "./organizations/orderer";
import PeerOrganization from "./organizations/peer";
import OrganizationRepresentation from "./organizations/representation";

export default class RepresentationCreator {
    private options: Options;
    private cryptoConfig: any;
    private configTxOrganizations: any;

    constructor(kubechain: Kubechain) {
        this.options = new Options(kubechain);

        this.cryptoConfig = YamlJs.load(this.options.get('$.configuration.paths.cryptoconfig'));
        const configTx = YamlJs.load(this.options.get('$.configuration.paths.configtx'));
        this.configTxOrganizations = configTx.Organizations;
    }

    createOrdererRepresentations(): OrganizationRepresentation[] {
        const ordererConfigurations = this.matchConfigurationOrganizations(this.cryptoConfig.OrdererOrgs, this.configTxOrganizations);
        const ordererOrganizationsPath = this.options.get('$.blockchain.organizations.paths.ordererorganizations');
        const representations: OrganizationRepresentation[] = [];

        ordererConfigurations.forEach((configuration: any) => {
            representations.push(new OrdererOrganization(configuration.name, Path.join(ordererOrganizationsPath, configuration.domain), configuration.domain, configuration.mspId).toJson())
        });

        return representations;
    }

    createPeerRepresentations(): OrganizationRepresentation[] {
        const peerConfigurations = this.matchConfigurationOrganizations(this.cryptoConfig.PeerOrgs, this.configTxOrganizations);
        const ordererOrganizationsPath = this.options.get('$.blockchain.organizations.paths.peerorganizations');
        const representations: OrganizationRepresentation[] = [];

        peerConfigurations.forEach((configuration: any) => {
            representations.push(new PeerOrganization(configuration.name, Path.join(ordererOrganizationsPath, configuration.domain), configuration.domain, configuration.mspId).toJson())
        });
        return representations;

    }

    private matchConfigurationOrganizations(cryptoOrganizations: any[], configTxOrganizations: any[]): any[] {
        const matchedOrganizations: any[] = [];
        if (configTxOrganizations) {
            cryptoOrganizations.forEach((cryptoOrganization) => {
                const found = configTxOrganizations.find((configTxOrganization) => {
                    return this.cryptoOrganizationMatchesConfigTxOrganization(cryptoOrganization, configTxOrganization);
                });
                if (found) {
                    matchedOrganizations.push({
                        name: cryptoOrganization.Name,
                        domain: cryptoOrganization.Domain,
                        mspId: found.ID
                    });
                }
            });
        }

        return matchedOrganizations;
    }

    private cryptoOrganizationMatchesConfigTxOrganization(cryptoOrganization: any, configTxOrganization: any) {
        return cryptoOrganization.Name === configTxOrganization.Name;
    }

}
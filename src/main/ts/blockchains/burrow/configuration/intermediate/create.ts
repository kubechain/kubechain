import * as Path from 'path';
import * as ConfigurationUtil from '../utilities/util';
import * as Accounts from '../utilities/accounts/accounts';
import IAccountType from "../utilities/accounts/iaccount";
import * as Nodes from '../utilities/nodes/nodes';
import SeedNode from "../utilities/nodes/seed";
import PeerNode from "../utilities/nodes/peer";

export default class IntermediateRepresentationCreator {
    private options: any;
    private accounts: Array<IAccountType>;

    constructor(options: any) {
        this.options = options;
        this.accounts = this.initAccounts();
    }

    private initAccounts() {
        const accountNames = ConfigurationUtil.getAccountNamesFromFileSystem(this.options.get('$.blockchain.intermediate.paths.configuration'));
        return accountNames.map(accountName => {
            return Accounts.getAccountForPath(Path.join(this.options.get('$.blockchain.intermediate.paths.configuration'), accountName));
        });
    }

    changeConfigurations() {
        const representations = this.accounts.map(account => {
            return account.toJSON();
        });
        const seeds = Nodes.getSeeds(representations);
        const seedsFullyQualifiedDomainNames = this.seedsToFullyQualifiedDomainNames(seeds);
        const peers = Nodes.getPeers(representations);
        this.changeConfigurationForSeeds(seeds);
        this.changeConfigurationForPeers(peers, seedsFullyQualifiedDomainNames);
    }


    private changeConfigurationForSeeds(seeds: SeedNode[]) {
        seeds.forEach(seed => {
            seed.adjustConfigurationForKubernetes();
        })
    }

    private changeConfigurationForPeers(peers: PeerNode[], seedsFullyQualifiedDomainNames: string[]) {
        peers.forEach(peer => {
            peer.setSeedAddresses(seedsFullyQualifiedDomainNames);
            peer.adjustConfigurationForKubernetes();
        })
    }

    private seedsToFullyQualifiedDomainNames(seeds: SeedNode[]) {
        const fullyQualifiedDomainNames: string[] = [];
        const peer2peerPort = 46656;
        seeds.forEach(seed => {
            return `${seed.addFullyQualifiedDomainNameToArray(fullyQualifiedDomainNames, this.options.get('$.name'), this.options.get('$.name'))}:${peer2peerPort}`;
        });
        return fullyQualifiedDomainNames;
    }
}
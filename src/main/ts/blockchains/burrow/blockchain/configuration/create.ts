import * as fs from 'fs-extra';
import * as Accounts from '../../utilities/accounts/accounts';
import * as Nodes from '../../utilities/nodes/nodes';
import SeedNode from "../../utilities/nodes/seed";
import PeerNode from "../../utilities/nodes/peer";
import Options from "../../options";
import Kubechain from "../../../../kubechain/kubechain";
import ICommandExecutor from "../../../utilities/icommandexecutor";


// NOTE: Currently this class does not "create" the configuration.
// It copies and adjusts existing configuration located at: `./configuration/burrow/`
export default class ChainConfigurationCreator implements ICommandExecutor {
    private options: Options;

    //TODO: Duplication, remove.
    validCommandForChain(chain: string): boolean {
        return chain === 'burrow';
    }

    create(kubechain: Kubechain) {
        //TODO: max_num_peers = 20
        this.options = new Options(kubechain);
        console.info("[BURROW CONFIGURATION]");
        this.copyConfigurationToIntermediateDirectory();
        this.changeConfigurations();
    }

    private copyConfigurationToIntermediateDirectory() {
        console.info("Copying configuration");
        fs.copySync(this.options.get('$.configuration.accounts.paths.root'),
            this.options.get('$.blockchain.intermediate.paths.configuration'),
            {overwrite: true}
        );
    }

    private changeConfigurations() {
        console.info("Adjusting account configuration");
        const representations = Accounts.getAccountRepresentationsFromPath(
            this.options.get('$.blockchain.intermediate.paths.configuration')
        );
        const amountOfSeeds = this.options.get('$.blockchain.nodes.seeds.amount');
        const nodes = Nodes.accountRepresentationsToNodes(representations, amountOfSeeds);

        // const seeds = Nodes.getSeeds(representations);
        const seedsFullyQualifiedDomainNames = this.seedsToPeerToPeerAddresses(nodes.seeds);
        // const peers = Nodes.getPeers(representations);
        this.changeConfigurationForSeeds(nodes.seeds);
        this.changeConfigurationForPeers(nodes.peers, seedsFullyQualifiedDomainNames);
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

    private seedsToPeerToPeerAddresses(seeds: SeedNode[]) {
        const peerToPeerAddresses: string[] = [];
        seeds.forEach(seed => {
            seed.addPeerToPeerAddressToArray(peerToPeerAddresses, this.options.get('$.name'), this.options.get('$.name')
            );
        });
        return peerToPeerAddresses;
    }
}
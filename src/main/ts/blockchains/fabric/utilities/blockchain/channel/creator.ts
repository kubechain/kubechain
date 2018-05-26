import * as Path from "path";
import * as fs from "fs-extra";
import {executeCommand} from "../../../../utilities/shellcommand";
import Options from "./options";
import FabricOptions from "../../../options";

export default class ChannelCreator {
    private channel: Options;
    private options: FabricOptions;
    private channelName: string;
    private path: string;
    private configTxgenPath: string;

    constructor(channel: Options, options: FabricOptions) {
        this.channel = channel;
        this.options = options;
        this.initializeName(channel);
        this.path = channel.path || Path.join(this.options.get('$.blockchain.paths.channels'), this.channelName);
        this.configTxgenPath = Path.join(this.options.get('$.blockchain.paths.bin'), 'configtxgen');
    }

    async create() {
        this.createChannelDirectory();
        await this.createChannelTransactionFile();
        await this.createOrganizationAnchorUpdateTransactionFiles();
    }

    private initializeName(channel: Options) {
        if (channel.name) {
            this.channelName = channel.name.toLowerCase();
        } else {
            throw new Error("Channel needs a name.");
        }
    }

    private createChannelDirectory() {
        try {
            fs.mkdirsSync(this.path);
        }
        catch (e) {
            console.error(e);
        }
    }

    private async createChannelTransactionFile() {
        const channelTx = Path.join(this.path, this.channelName + '.tx');
        await executeCommand(`"${this.configTxgenPath}" -profile ${this.channel.profile} -outputCreateChannelTx "${channelTx}" -channelID ${this.channelName}`, undefined);

    }

    private async createOrganizationAnchorUpdateTransactionFile(organization: string) {
        const organizationTx = Path.join(this.path, `${organization}anchors.tx`);
        await executeCommand(`"${this.configTxgenPath}" -profile ${this.channel.profile} -outputAnchorPeersUpdate "${organizationTx}" -channelID ${this.channelName} -asOrg ${organization}`, undefined)
    }

    private async createOrganizationAnchorUpdateTransactionFiles() {
        if (this.channel.organizations) {
            for (let i = 0; i < this.channel.organizations.length; i++) {
                const organization = this.channel.organizations[i];
                await this.createOrganizationAnchorUpdateTransactionFile(organization);
            }
        }

    }
}
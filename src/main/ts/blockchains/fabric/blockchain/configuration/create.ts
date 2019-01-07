import * as path from 'path';
import * as fs from 'fs-extra';
import * as shell from 'shelljs';
import * as download from 'download';

import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from "../../../../kubechain/kubechain";
import Options from "../../options";

import * as Platforms from '../../utilities/host/platforms/platforms';
import * as Architectures from '../../utilities/host/architectures/architectures';
import {findShellDependencies} from "../../../../util";
import IArchitecture from "../../utilities/host/architectures/iarchitecture";
import {executeCommand} from "../../../utilities/shellcommand";
import ChannelCreator from "../../utilities/blockchain/channel/creator";
import ChannelOptions from "../../utilities/blockchain/channel/options";
import ConfigTx from "../../utilities/blockchain/configuration/configtx";

export default class ChainConfigurationCreator implements ICommandExecutor {
    private kubechain: Kubechain;
    private options: Options;

    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    async create(kubechain: Kubechain) {
        this.kubechain = kubechain;
        this.options = new Options(this.kubechain);
        return new Promise(async (resolve, reject) => {
            try {
                console.info('[FABRIC CONFIGURATION]');
                await this.verifyFabricBinaries();
                await this.createCryptogpraphicMaterial();
                await this.createChannelTransactions();
                resolve();
            } catch (e) {
                console.error('Error: Unable to create Fabric configuration.');
                console.error('Reason:', e);
                reject(e);
            }
        })
    }

    private verifyFabricBinaries() {
        return new Promise(async (resolve, reject) => {
            if (this.shouldDownloadDependencies()) {
                try {
                    await this.downloadFabricTarball();
                    resolve()
                }
                catch (e) {
                    reject(e)
                }
            }
            resolve()
        });
    }

    private shouldDownloadDependencies() {
        const found = this.findShellDependenciesInBin();
        let result = true;
        for (let dependency in found) {
            if (found.hasOwnProperty(dependency)) {
                result = result && found[dependency];
            }
        }
        return !result;
    }

    findShellDependenciesInBin() {
        const binaryPath = this.options.get('$.blockchain.paths.bin');
        return findShellDependencies([path.join(binaryPath, "cryptogen"), path.join(binaryPath, "configtxgen")]);
    }

    private downloadFabricTarball() {
        return new Promise(async (resolve, reject) => {
            try {
                const hostPlatform = Platforms.getHostPlatform();
                const architecture: IArchitecture = Architectures.getHostArchitecture();
                if (hostPlatform.isHostArchitectureSupported()) {
                    const version = this.options.get('$.version');
                    const fullName = `${hostPlatform.name()}-${architecture.name()}-${version}`;
                    const tarballUrl = `https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric/hyperledger-fabric/${fullName}/hyperledger-fabric-${fullName}.tar.gz`;
                    console.info("Downloading:", path.basename(tarballUrl));
                    await download(tarballUrl, this.options.get('$.blockchain.paths.root'), {extract: true});
                    console.info('Finished downloading and extracting tarball');
                    if (hostPlatform.name() === "windows") {
                        console.info("Renaming Fabric configuration generators");
                        await this.addExeFileExtention();
                        console.info('Done renaming files');
                    }
                }
                else {
                    reject(new Error(`Unsupported host architecture.`))
                }
            }
            catch (e) {
                reject(e);
            }
            resolve();
        });
    }

    private addExeFileExtention() {
        const binaryPath = this.options.get('$.blockchain.paths.bin');
        return new Promise((resolve, reject) => {
            const filesWithoutExtension: string[] = [];
            try {
                fs.readdirSync(binaryPath).forEach((fileName: string) => {
                    if (path.extname(fileName) === '') {
                        filesWithoutExtension.push(fileName);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
            filesWithoutExtension.forEach(fileName => {
                const filePath = path.join(binaryPath, fileName);
                try {
                    fs.renameSync(filePath, filePath + '.exe');
                }
                catch (e) {
                    console.error(e.message || e);
                }
            });
            resolve();
        });
    }

    private createCryptogpraphicMaterial() {
        return new Promise(async (resolve, reject) => {
            try {
                console.info("Generating cryptographic artifacts");
                this.copyConfigurationFilesToBlockchainRoot();
                this.setMandatoryEnvironmentVariablesForFabricConfiguration();
                this.changeWorkingDirectoryForCryptoGenOutput();
                await executeCommand(this.cryptoArtifactsCommand(), {silent: true});
                await this.createGenesisBlock();
                this.changeWorkingDirectoryBackToRoot();
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }

    private copyConfigurationFilesToBlockchainRoot() {
        shell.cp(this.options.get('$.configuration.paths.configtx'), this.options.get('$.blockchain.paths.root'));
        shell.cp(this.options.get('$.configuration.paths.cryptoconfig'), this.options.get('$.blockchain.paths.root'));
        fs.copySync(this.options.get('$.configuration.paths.chaincodes'), this.options.get('$.blockchain.paths.chaincodes'));
    }

    private setMandatoryEnvironmentVariablesForFabricConfiguration() {
        process.env.FABRIC_CFG_PATH = this.options.get('$.blockchain.paths.root');
    }

    private changeWorkingDirectoryForCryptoGenOutput() {
        shell.cd(this.options.get('$.blockchain.paths.root'));
    }

    cryptoArtifactsCommand() {
        return `"${path.join(this.options.get('$.blockchain.paths.bin'), 'cryptogen')}" generate --config="${path.join(this.options.get('$.configuration.paths.cryptoconfig'))}"`;
    }

    private changeWorkingDirectoryBackToRoot() {
        shell.cd(this.kubechain.get('$.paths.root'));
    }

    private createGenesisBlock() {
        return new Promise(async (resolve, reject) => {
            console.info("Generating genesis block");
            const command = await this.genesisBlockCommand();
            executeCommand(command, {silent: true}).then(() => {
                this.copyGenesisBlockToOrderers();
                resolve();
            }).catch(reject);
        });
    }

    private async genesisBlockCommand() {
        const profile = this.options.get('$.options.profile') || await this.promptUserForProfile();
        return `"${path.join(this.options.get('$.blockchain.paths.bin'), 'configtxgen')}" -profile ${profile} -outputBlock "${path.join(this.options.get('$.blockchain.paths.root'), 'genesis.block')}"`;
    }

    private promptUserForProfile() {
        const configTx = new ConfigTx(this.options.get('$.blockchain.configuration.paths.configtx'));
        return configTx.promptUserForProfile();
    }

    private copyGenesisBlockToOrderers() {
        console.info("Copying genesis block to orderers");
        const organizationsPath = this.options.get('$.blockchain.organizations.paths.*');
        const ordererOrganizationPaths = fs.readdirSync(path.join(organizationsPath, "ordererOrganizations"));
        ordererOrganizationPaths.map((orgPath: string) => {
                shell.cp(path.join(this.options.get('$.blockchain.paths.root'), 'genesis.block'), path.join(organizationsPath, "ordererOrganizations", orgPath, 'genesis.block'));
            }
        );
    }

    private createChannelTransactions() {
        const channels = this.options.get('$.options.channels') || [];
        const promises = channels.map((options: ChannelOptions) => {
            const creator = new ChannelCreator(options, this.options);
            return creator.create()
        });
        return Promise.all(promises);
    }
}
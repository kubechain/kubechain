import * as path from 'path';
import * as fs from 'fs-extra';
import * as shell from 'shelljs';
import * as download from 'download';

import ICommandExecutor from "../../../utilities/icommandexecutor";
import Kubechain from "../../../../kubechain";
import Options from "../../options";

import * as Platforms from '../../utilities/host/platforms/platforms';
import * as Architectures from '../../utilities/host/architectures/architectures';
import {createDirectories, findShellDependencies} from "../../../../util";
import IArchitecture from "../../utilities/host/architectures/iarchitecture";
import {executeCommand} from "../../../utilities/shellcommand";

export default class ChainConfigurationCreator implements ICommandExecutor {
    private kubechain: Kubechain;
    private options: Options;

    validCommandForChain(chain: string): boolean {
        return chain === 'fabric';
    }

    constructor() {
        this.kubechain = new Kubechain();
        this.options = new Options(this.kubechain);
    }

    async create() {
        return new Promise(async (resolve, reject) => {
            try {
                console.info('[FABRIC CONFIGURATION]');
                this.createDirectories();
                await this.verifyFabricBinaries();
                await this.createChainConfiguration();
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

    private createDirectories() {
        console.info("Creating directories");
        createDirectories(this.options.getAll('$.blockchain..paths.*'));
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

    private createChainConfiguration() {
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

    /**
     * After creating a configuration profile as desired, simply invoke

     configtxgen -profile <profile_name> -outputBlock orderer_genesisblock.pb

     This will produce an orderer_genesisblock.pb file in the current directory.
     This genesis block is used to bootstrap the ordering system channel, which the orderers use to authorize and orchestrate creation of other channels.
     By default, the channel ID encoded into the genesis block by configtxgen will be testchainid.
     It is recommended that you modify this identifier to something which will be globally unique.

     Then, to utilize this genesis block, before starting the orderer,
     simply specify ORDERER_GENERAL_GENESISMETHOD=file and ORDERER_GENERAL_GENESISFILE=$PWD/orderer_genesisblock.pb or modify the orderer.yaml file to encode these values.
     * @returns {Promise<>}
     * @private
     */
    private createGenesisBlock() {
        return new Promise((resolve, reject) => {
            console.info("Generating genesis block");
            executeCommand(this.genesisBlockCommand(), {silent: true}).then(() => {
                this.copyGenesisBlockToOrderers();
                resolve();
            }).catch(reject);
        });
    }

    private genesisBlockCommand() {
        return `"${path.join(this.options.get('$.blockchain.paths.bin'), 'configtxgen')}" -profile TwoOrgsOrdererGenesis -outputBlock "${path.join(this.options.get('$.blockchain.paths.root'), 'genesis.block')}"`;
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
}
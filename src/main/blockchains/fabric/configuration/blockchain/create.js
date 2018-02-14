const path = require('path');
const fs = require('fs-extra');
const shell = require('shelljs');
const download = require('download');

const Platforms = require('../host/platforms/platforms');
const Architectures = require('../host/architectures/architectures');
const Util = require('../../../../util');
const FabricCommandExecutor = require('../../command');
const ShellCommand = require('../../../../command');
const FabricOptions = require('../../options');

class FabricChainConfigurationCreator extends FabricCommandExecutor {
    constructor(kubechain) {
        super();
        this._kubechain = kubechain;
        this._options = new FabricOptions(kubechain);
    }

    async create() {
        return new Promise(async (resolve, reject) => {
            try {
                console.info('[FABRIC CONFIGURATION]');
                this._createDirectories();
                await this._verifyFabricBinaries();
                await this._createChainConfiguration();
                resolve();
            } catch (e) {
                console.error('Error: Unable to create Fabric configuration.');
                console.error('Reason:', e);
                reject(e);
            }
        })
    }

    _verifyFabricBinaries() {
        return new Promise(async (resolve, reject) => {
            if (this._shouldDownloadDependencies()) {
                try {
                    await this._downloadFabricTarball();
                    resolve()
                }
                catch (e) {
                    reject(e)
                }
            }
            resolve()
        })
    }

    _shouldDownloadDependencies() {
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
        const binaryPath = this._options.get('$.blockchain.paths.bin');
        return Util.findShellDependencies([path.join(binaryPath, "cryptogen"), path.join(binaryPath, "configtxgen")]);
    }

    _createDirectories() {
        console.info("...Creating directories");
        Util.createDirectories(this._options.getAll('$.blockchain..paths.*'));
    }

    _downloadFabricTarball() {
        return new Promise(async (resolve, reject) => {
            try {
                const hostPlatform = Platforms.getHostPlatform();
                const architecture = Architectures.getHostArchitecture();
                if (hostPlatform.isHostArchitectureSupported()) {
                    const version = this._options.get('$.version');
                    const tarballUrl = `https://nexus.hyperledger.org/content/repositories/releases/org/hyperledger/fabric/hyperledger-fabric/${hostPlatform.name()}-${architecture.name()}-${version}/hyperledger-fabric-${hostPlatform.name()}-${architecture.name()}-${version}.tar.gz`;
                    console.info("...Downloading:", path.basename(tarballUrl));
                    await download(tarballUrl, this._options.get('$.blockchain.paths.root'), {extract: true});
                    console.info('...Finished downloading and extracting tarball');
                    if (hostPlatform.name() === "windows") {
                        console.info("...Renaming Fabric configuration generators");
                        await this._addExeFileExtention();
                        console.info('...Done renaming files');
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

    _addExeFileExtention() {
        const binaryPath = this._options.get('$.blockchain.paths.bin');
        return new Promise((resolve, reject) => {
            let filesWithoutExtention = [];
            try {
                fs.readdirSync(binaryPath).map(file => {
                    if (path.extname(file) === '') {
                        filesWithoutExtention.push(file);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
            filesWithoutExtention.map(file => {
                const filePath = path.join(binaryPath, file);
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

    _createChainConfiguration() {
        return new Promise(async (resolve, reject) => {
            try {
                console.info("...Generating cryptographic artifacts");
                this._copyConfigurationFilesToBlockchainRoot();
                this._setMandatoryEnvironmentVariablesForFabricConfiguration();
                this._changeWorkingDirectoryForCryptoGenOutput();
                await ShellCommand.executeCommand(this.cryptoArtifactsCommand(), {silent: true});
                await this._createGenesisBlock();
                this._changeWorkingDirectoryBackToRoot();
                resolve();
            }
            catch (e) {
                reject(e);
            }
        });
    }

    _copyConfigurationFilesToBlockchainRoot() {
        shell.cp(this._options.get('$.configuration.paths.configtx'), this._options.get('$.blockchain.paths.root'));
        shell.cp(this._options.get('$.configuration.paths.cryptoconfig'), this._options.get('$.blockchain.paths.root'));
    }

    _setMandatoryEnvironmentVariablesForFabricConfiguration() {
        process.env.FABRIC_CFG_PATH = this._options.get('$.blockchain.paths.root');
    }

    _changeWorkingDirectoryForCryptoGenOutput() {
        shell.cd(this._options.get('$.blockchain.paths.root'));
    }

    cryptoArtifactsCommand() {
        return `"${path.join(this._options.get('$.blockchain.paths.bin'), 'cryptogen')}" generate --config="${path.join(this._options.get('$.configuration.paths.cryptoconfig'))}"`;
    }

    _changeWorkingDirectoryBackToRoot() {
        shell.cd(this._kubechain.get('$.paths.root'));
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
     * @returns {Promise<any>}
     * @private
     */
    _createGenesisBlock() {
        return new Promise((resolve, reject) => {
            console.info("...Generating genesis block");
            ShellCommand.executeCommand(this._genesisBlockCommand(), {silent: true}).then(() => {
                this._copyGenesisBlockToOrderers();
                resolve();
            }).catch(reject);
        });
    }

    _genesisBlockCommand() {
        return `"${path.join(this._options.get('$.blockchain.paths.bin'), 'configtxgen')}" -profile TwoOrgsOrdererGenesis -outputBlock "${path.join(this._options.get('$.blockchain.paths.root'), 'genesis.block')}"`;
    }

    _copyGenesisBlockToOrderers() {
        console.info("...Copying genesis block to orderers");
        const organizationsPath = this._options.get('$.blockchain.organizations.paths.*');
        const ordererOrganizationPaths = fs.readdirSync(path.join(organizationsPath, "ordererOrganizations"));
        ordererOrganizationPaths.map(orgPath => {
                shell.cp(path.join(this._options.get('$.blockchain.paths.root'), 'genesis.block'), path.join(organizationsPath, "ordererOrganizations", orgPath, 'genesis.block'));
            }
        );
    }
}

module.exports = FabricChainConfigurationCreator;
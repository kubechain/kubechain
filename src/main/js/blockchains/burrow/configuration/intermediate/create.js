const fs = require('fs-extra');
const CommandExecutor = require('../../command');
const Options = require('../../options');
const RepresentationCreator = require('../../../../../lib/ts/blockchains/burrow/configuration/intermediate/create').default;


class IntermediateRepresentationCreator extends CommandExecutor {
    constructor() {
        super();
        this._options = new Options();
    }

    create() {
        console.info("[INTERMEDIATE]");
        this._copyConfigurationToIntermediateDirectory();
        this.representationCreator = new RepresentationCreator(this._options);
        // this._createRepresentations();
        this._changeConfigurationForAccounts();
    }

    _copyConfigurationToIntermediateDirectory() {
        console.info("Copying configuration");
        fs.copySync(this._options.get('$.configuration.accounts.paths.root'),
            this._options.get('$.blockchain.intermediate.paths.configuration'),
            {overwrite: true}
        );
    }

    _createRepresentations() {
        console.info("Creating representations");
        this.representationCreator.createRepresentations();
    }

    _changeConfigurationForAccounts() {
        console.info("Adjusting configuration for accounts");
        this.representationCreator.changeConfigurations();

    }
}

module.exports = IntermediateRepresentationCreator;
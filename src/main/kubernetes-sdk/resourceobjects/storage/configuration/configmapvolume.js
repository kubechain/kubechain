const ConfigurationVolume = require('./configurationvolume');

class ConfigMapVolume extends ConfigurationVolume {
    constructor(configMapName) {
        super(configMapName);
        this._configMapName = configMapName;
    }

    _addItemsToType() {
        const items = Object.values(this._itemsMap);
        return {
            "configMap":
                Object.assign(
                    {
                        "name": this._configMapName
                    },
                    (items.length > 0) ? {"items": items} : undefined
                )
        };
    }
}

module.exports = ConfigMapVolume;
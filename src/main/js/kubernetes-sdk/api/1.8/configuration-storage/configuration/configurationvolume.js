const PodVolume = require('../storage/podvolume');

class ConfigurationVolume extends PodVolume {
    constructor(name) {
        super(name);
        this._itemsMap = {};
    }

    addItem(key, path) {
        this._itemsMap[key] = {
            "key": key,
            "path": path
        };
    }

    toJSON() {
        return Object.assign(super.toJSON(), this._addItemsToType());
    }
}

module.exports = ConfigurationVolume;
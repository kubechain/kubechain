const ConfigurationVolume = require('./configurationvolume');

class SecretVolume extends ConfigurationVolume {
    constructor(secretName) {
        super(secretName);
        this._secretName = secretName;
    }

    _addItemsToType() {
        const items = Object.values(this._itemsMap);
        return {
            "secret":
                Object.assign(
                    {
                        "secretName": this._secretName
                    },
                    (items.length > 0) ? {"items": items} : undefined
                )
        };
    }

    toVolumeMount(mountPath) {
        return Object.assign(super.toVolumeMount(mountPath), {"readOnly": true})
    }
}

module.exports = SecretVolume;
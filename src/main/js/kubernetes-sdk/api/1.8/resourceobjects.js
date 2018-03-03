function resourceObjectsToJson(resourceObjects) {
    return resourceObjects.map(resourceObject => resourceObject.toJSON())
}

module.exports = {
    resourceObjectsToJson
};
class FabricCommandExecutor {
    static validCommandForChain(chain) {
        return chain === FabricCommandExecutor.name();
    }

    static name() {
        return 'fabric';
    }
}

module.exports = FabricCommandExecutor;
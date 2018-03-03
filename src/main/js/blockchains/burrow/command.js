class CommandExecutor {
    static validCommandForChain(chain) {
        return chain === CommandExecutor.name();
    }

    static name() {
        return 'burrow';
    }
}

module.exports = CommandExecutor;
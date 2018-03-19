export default interface ICommandExecutor {
    validCommandForChain(chain: string): boolean;
}
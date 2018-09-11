import KubechainTargets from "./targets";

export default interface KubechainOptions {
    name: string
    targets: KubechainTargets
    kubernetes: {
        context: string
    }
    paths: {
        root: string
        configuration: string
        blockchains: string
        kubernetes: string
    }
    adapter: {
        hooks: object
        options: object
    }
}
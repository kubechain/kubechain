import ITargets from "./itargets";
import ITargetsJson from "./itargetsjson";

export default class KubechainTargets implements ITargets {
    private blockchain: string;
    private kubernetes: string;

    constructor(targets: ITargetsJson) {
        this.blockchain = targets.blockchain;
        this.kubernetes = targets.kubernetes;
    }

    matchesBlockchainTarget(target: string): boolean {
        return this.blockchain === target;
    }

    matchesKubernetesTarget(target: string): boolean {
        return this.kubernetes === target;
    }

    toJson(): ITargetsJson {
        return {
            blockchain: this.blockchain,
            kubernetes: this.kubernetes
        }
    }
}

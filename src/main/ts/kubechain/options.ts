import * as Path from "path";
import IContainer from "../kubernetes-sdk/api/1.8/workloads/container/icontainer";
import Affinity from "../kubernetes-sdk/api/1.8/workloads/pod/affinity/affinity";
import KubechainTargets from "./targets";

const jsonpath = require('jsonpath');

interface IOptions {
    targets: KubechainTargets
    paths: {
        root: string
        configuration: string
        blockchains: string
        kubernetes: string
    }
    kubernetes: {
        workloads: {
            affinity: Affinity
            additionalContainers: IContainer[]
        }
        namespace: string
    }
}

export default class Options {
    private options: IOptions;

    constructor() {
        this.options = Options.defaults();
    }

    private static defaults(): IOptions {
        const cwd = process.cwd();
        return {
            targets: new KubechainTargets({blockchain: "", kubernetes: ""}),
            paths: {
                root: cwd,
                configuration: Path.join(cwd, 'configuration'),
                blockchains: Path.join(cwd, 'blockchains'),
                kubernetes: Path.join(cwd, 'kubernetes')
            },
            kubernetes: {
                workloads: {
                    affinity: undefined,
                    additionalContainers: undefined
                },
                namespace: undefined
            }
        };
    }

    get(jsonPath: string) {
        return jsonpath.value(this.options, jsonPath)
    }

    getAll(jsonPath: string) {
        return jsonpath.query(this.options, jsonPath)
    }
}
import * as Path from "path";

const jsonpath = require('jsonpath');
import KubechainTargets from "./targets";
import ITargetsJson from "./itargetsjson";
import {promptUserForDesiredContext} from "../blockchains/utilities/cluster";

interface Options {
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

export default class Kubechain {
    private options: Options;

    constructor(targets: KubechainTargets) {
        this.options = Kubechain.defaults();
        if (targets) {
            this.options.name = this.targetsToName(targets.toJson());
            this.options.targets = targets;
        }
    }

    private targetsToName(targets: ITargetsJson) {
        return targets.blockchain + "-" + targets.kubernetes
    }

    async loadOptionsFromFileSystem() {
        const cwd = process.cwd();
        console.warn("Loading configuration from file system..");
        const config = require(Path.join(cwd, 'kubechain.config.js'));
        this.options.name = this.targetsToName(config.targets);
        this.options.targets = new KubechainTargets(config.targets);
        this.options.kubernetes.context = config.kubernetes.context || await promptUserForDesiredContext();
        this.options.adapter = config.adapter;
        this.options.paths = Kubechain.defaults().paths;
    }

    private static defaults(): Options {
        const cwd = process.cwd();
        return {
            name: "",
            targets: new KubechainTargets({
                blockchain: "",
                kubernetes: ""
            }),
            kubernetes: {
                context: ""
            },
            adapter: {
                hooks: {},
                options: {}
            },
            paths: {
                root: cwd,
                configuration: Path.join(cwd, 'configuration'),
                blockchains: Path.join(cwd, 'blockchains'),
                kubernetes: Path.join(cwd, 'kubernetes')
            }
        };
    }

    get(jsonPath: string) {
        return jsonpath.value(this.options, jsonPath)
    }
}
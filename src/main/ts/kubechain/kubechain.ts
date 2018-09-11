import * as Path from "path";
import KubechainTargets from "./targets";
import ITargetsJson from "./itargetsjson";
import {promptUserForDesiredContext} from "../blockchains/utilities/cluster";
import KubechainOptions from "./options";

const jsonpath = require('jsonpath');

export default class Kubechain {
    private options: KubechainOptions;

    constructor(targets: KubechainTargets) {
        this.options = Kubechain.defaults();
        if (targets) {
            this.options.name = this.targetsToName(targets.toJson());
            this.options.targets = targets;
        }
    }

    setOptions(options: KubechainOptions) {
        this.options = options;
    }

    private targetsToName(targets: ITargetsJson) {
        return targets.blockchain + "-" + targets.kubernetes
    }

    async loadOptionsFromFileSystem() {
        const cwd = process.cwd();
        console.warn("Loading configuration from file system..");
        const config = require(Path.join(cwd, 'kubechain.config.js'));
        this.options.name = config.name || this.targetsToName(config.targets);
        this.options.targets = new KubechainTargets(config.targets);
        this.options.kubernetes.context = (config.kubernetes) ? config.kubernetes.context : await promptUserForDesiredContext();
        this.options.adapter = config.adapter;
        this.options.paths = Kubechain.defaults().paths;
    }

    private static defaults(): KubechainOptions {
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
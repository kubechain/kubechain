import * as Path from "path";

const jsonpath = require('jsonpath');
import KubechainTargets from "./targets";
import IHooks from "../blockchains/utilities/iadapterhooks";
import ITargetsJson from "./itargetsjson";

interface Options {
    name: string
    targets: KubechainTargets
    paths: {
        root: string
        configuration: string
        blockchains: string
        kubernetes: string
    }
    adapter: {
        hooks: IHooks
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

    loadOptionsFromFileSystem() {
        const cwd = process.cwd();
        console.warn("Loading configuration from file system..");
        const config = require(Path.join(cwd, 'kubechain.config.js'));
        this.options.name = this.targetsToName(config.targets);
        this.options.targets = new KubechainTargets(config.targets);
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
            adapter: {
                hooks: {
                    loadedConfiguration(data: any) {
                    },

                    createdRepresentations(data: any) {
                    },

                    createdWorkloads(data: any) {
                    },

                    beforeWrite(data: any) {
                    },

                    written(data: any) {
                    },
                    workload: {
                        beforeCreate(data: any) {
                        },
                        createdConfiguration(data: any) {
                        },
                        created(data: any) {
                        },
                        beforeWrite(data: any) {
                        }
                    }
                },
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

    getAll(jsonPath: string) {
        return jsonpath.query(this.options, jsonPath)
    }

    getOptions() {
        return this.options;
    }
}
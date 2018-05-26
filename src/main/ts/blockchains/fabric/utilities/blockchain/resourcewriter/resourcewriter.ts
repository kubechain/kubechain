import {toJsonFile} from "../../../../../util";
import IHooks from "../../../../utilities/iadapterhooks";
import WriteResource from "./iwriteresource";

export default class ResourceWriter {
    private hooks: IHooks;
    private resources: WriteResource[];
    private workloads: WriteResource[];

    constructor(hooks: IHooks) {
        this.hooks = hooks;
        this.resources = [];
        this.workloads = [];
    }

    write() {
        this.hooks.beforeWrite({
            resources: this.resources,
            workloads: this.workloads
        });

        this.resources.forEach((resource: WriteResource) => {
            toJsonFile(resource.path, resource.name, resource.resource.toJson());
        });
        this.workloads.forEach((resource: WriteResource) => {
            // this.hooks.workload.beforeWrite({});
            toJsonFile(resource.path, resource.name, resource.resource.toJson());
        });

        // this.hooks.written({});
    }

    addResource(resource: WriteResource) {
        this.resources.push(resource);
    }

    addWorkload(resource: WriteResource) {
        this.workloads.push(resource);
    }
}
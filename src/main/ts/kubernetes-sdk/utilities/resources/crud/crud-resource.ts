import * as Kinds from "../../kinds/kinds";
import IKind from "../../kinds/ikind";
import Namespace from "../../kinds/cluster/namespace";

export default class CrudResource {
    private resource: any;
    private baseApi: boolean;
    private group: string;
    private version: string;
    private kind: IKind;
    private namespace: string;

    constructor(resource: any, kind: IKind) {
        this.resource = resource;
        this.kind = kind;
        this.namespace = resource.metadata.namespace;
        this.splitApiVersion();
    }

    private splitApiVersion() {
        const split = this.resource.apiVersion.split('/');
        if (split && split.length > 1) {
            this.group = split[0];
            this.version = split[1];
            this.baseApi = false;
        }
        else {
            this.version = this.resource.apiVersion;
            this.baseApi = true;
        }
    }

    private baseApiMethod(client: any): any {
        let apiMethod = client.api[this.version];
        if (!this.baseApi) {
            apiMethod = client.apis[this.group][this.version];
        }
        apiMethod = this.addNameSpacingToApiMethod(apiMethod);
        if (this.kind.toString() !== new Namespace().toString()) {
            apiMethod = this.addKind(apiMethod)
        }
        return apiMethod;
    }

    private addNameSpacingToApiMethod(apiMethod: any): any {
        if (Kinds.kindIsNamespaced(this.kind.toString())) {
            return apiMethod.namespaces(this.namespace);
        }
        else if (this.kind.toString() === new Namespace().toString()) {
            return apiMethod.namespaces;
        }

        return apiMethod;
    }

    // api.v1.namespaces(namespace).persistentvolumeclaims.post

    private addKind(apiMethod: any): any {
        return apiMethod[this.kind.toPlural().toLowerCase()]
    }

    post(client: any): any {
        return this.baseApiMethod(client).post({body: this.resource});
    }

    delete(client: any): any {
        return this.baseApiMethod(client)(this.resource.metadata.name).delete();
    }

    get(client: any, options: any): any {
        return this.baseApiMethod(client)(this.resource.metadata.name).get(options);
    }
}
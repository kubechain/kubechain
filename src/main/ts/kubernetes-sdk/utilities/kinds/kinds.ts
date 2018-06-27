import Namespace from "./cluster/namespace";
import PersistentVolume from "./cluster/persistentvolume";
import ConfigMap from "./namespaced/configmap";
import IKind from "./ikind";
import Deployment from "./namespaced/deployment";
import PersistentVolumeClaim from "./namespaced/persistentvolumeclaim";
import Job from "./namespaced/job";
import Pod from "./namespaced/pod";
import Secret from "./namespaced/secret";
import Service from "./namespaced/service";
import StatefulSet from "./namespaced/statefulset";
import ClusterRole from "./cluster/clusterrole";
import ClusterRoleBinding from "./cluster/clusterrolebinding";
import StorageClass from "./cluster/storageclass";
import CustomResourceDefinition from "./cluster/customeresourcedefinition";
import ServiceAccount from "./cluster/serviceaccount";
import DaemonSet from "./namespaced/daemonset";

//TODO: Change to Enum.

function asStrings(): string[] {
    const strings: string[] = [];
    kindsWithoutNamespace().map(kind => {
        strings.push(kind.toString());
    });
    kindsWithNamespace().map(kind => {
        strings.push(kind.toString());
    });

    return strings;
}

function kindsWithoutNamespace(): IKind[] {
    return [
        new Namespace(),
        new PersistentVolume(),
        new StorageClass(),
        new CustomResourceDefinition(),
        new ClusterRoleBinding(),
        new ClusterRole()
    ];
}

function kindIsNamespaced(kind: string): boolean {
    return (kindsWithoutNamespace().find((compareTo: IKind) => {
        return kind === compareTo.toString();
    })) === undefined;
}

function kindIsWorkload(kind: string): boolean {
    const workloads: IKind[] = [new Pod(), new Deployment()];
    for (let i = 0; i < workloads.length; i++) {
        if (kind === workloads[i].toString()) {
            return true;
        }
    }
    return false;
}

function kindsWithNamespace(): IKind[] {
    return [new ServiceAccount(), new Secret(), new ConfigMap(), new PersistentVolumeClaim(), new Service(), new StatefulSet(), new Pod(), new Deployment(), new Job(), new DaemonSet()];
}

function isKind(kindToValidate: string) {
    const found = asStrings().find((kind: string) => {
        return kindToValidate === kind;
    });
    return found !== undefined;
}

export {
    asStrings,
    kindsWithoutNamespace,
    kindIsNamespaced,
    kindsWithNamespace,
    isKind,
    kindIsWorkload
}
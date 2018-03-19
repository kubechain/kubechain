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
        Namespace,
        PersistentVolume
    ];
}

function kindIsNamespaced(kind: string): boolean {
    return (kindsWithoutNamespace().find((compareTo: IKind) => {
        return kind === compareTo.toString();
    })) === undefined;
}

function kindsWithNamespace(): IKind[] {
    return [Secret, ConfigMap, PersistentVolumeClaim, Service, StatefulSet, Pod, Deployment, Job];
}

function isKind(kindToValidate: string) {
    const found = asStrings().find((kind: IKind) => {
        return kindToValidate === kind.toString();
    });
    return found !== undefined;
}

export {
    asStrings,
    kindsWithoutNamespace,
    kindIsNamespaced,
    kindsWithNamespace,
    isKind
}
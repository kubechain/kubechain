const Kinds = {
    namespace: "Namespace",
    service: "Service",
    persistentVolume: "PersistentVolume",
    persistentVolumeClaim: "PersistentVolumeClaim",
    configMap: "ConfigMap",
    secret: "Secret",
    pod: "Pod",
    deployment: "Deployment",
    statefulSet: "StatefulSet",
    job: "Job",
};

Kinds.asStrings = function () {
    const strings = [];
    Object.values(this).forEach(kind => {
        if (typeof kind !== "function") {
            strings.push(kind);
        }
    });

    return strings;

};

Kinds.kindsWithoutNamespace = function () {
    return [
        Kinds.namespace,
        Kinds.persistentVolume
    ];
};

Kinds.kindIsNamespaced = function (kind) {
    return (Kinds.kindsWithoutNamespace().find(compareTo => {
        return kind === compareTo;
    })) === undefined;
};

Kinds.kindsWithNamespace = function () {
    const namespacedKinds = [];
    Kinds.asStrings().forEach(kind => {
        if (Kinds.kindIsNamespaced(kind)) {
            namespacedKinds.push(kind);
        }
    });
    return namespacedKinds;
};

Kinds.isKind = function (kindToValidate) {
    const found = Kinds.asStrings().find(kind => {
        return kindToValidate === kind;
    });
    return found !== undefined;
};

module.exports = Kinds;
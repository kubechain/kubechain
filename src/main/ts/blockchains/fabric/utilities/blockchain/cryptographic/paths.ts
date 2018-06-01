import * as Path from "path";

function caPathOnHost(): string {
    return 'ca';
}

function caPathInContainer(): string {
    return Path.posix.join('ca', Path.posix.sep);
}

function peerPathOnHost(peerName: string): string {
    return Path.join('peers', peerName);
}

function peerPathInContainer(peerName: string): string {
    return Path.posix.join('peers', peerName);
}

function peerAdminMspPathOnHost(organizationName: string): string {
    return Path.join('users', `Admin@${organizationName}`, 'msp');
}

function peerAdminMspPathInContainer(organizationName: string): string {
    return Path.posix.join('users', `Admin@${organizationName}`, 'msp');
}

function peerTlsPathInContainer(name: string): string {
    return Path.posix.join('peers', name, 'tls');
}

function peerMspPathInContainer(name: string): string {
    return Path.posix.join('peers', name, 'msp');
}

function ordererTlsPathInContainer(name: string): string {
    return Path.posix.join('orderers', name, 'tls');
}

function ordererMspPathInContainer(name: string): string {
    return Path.posix.join('orderers', name, 'msp');
}

function genesisBlockFilePathInContainer(): string {
    return Path.posix.join('genesis', 'genesis.block');
}

function genesisBlockDirectoryPathInContainer(): string {
    return 'genesis';
}

function ordererPathInContainer(ordererName: string): string {
    return Path.posix.join('orderers', ordererName);
}

function ordererPathOnHost(ordererName: string): string {
    return Path.join('orderers', ordererName);
}

function minikubeSharedFolder(organizationName: string): string {
    return Path.posix.join(Path.posix.sep, 'data', '.kubechain', 'fabric', organizationName);
}

export {
    caPathOnHost,
    caPathInContainer,
    peerPathOnHost,
    peerPathInContainer,
    peerAdminMspPathInContainer,
    peerAdminMspPathOnHost,
    peerMspPathInContainer,
    peerTlsPathInContainer,
    ordererTlsPathInContainer,
    ordererMspPathInContainer,
    genesisBlockFilePathInContainer,
    genesisBlockDirectoryPathInContainer,
    ordererPathInContainer,
    ordererPathOnHost,
    minikubeSharedFolder
}
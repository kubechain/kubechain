const fs = require('fs-extra');
const Path = require('path');
const Naming = require('../../../../kubernetes-sdk/utilities/naming');

function getAccountNamesFromFileSystem(path: string): Array<string> {
    let accounts = {};
    const accountsFileContents = fs.readFileSync(Path.join(path, 'accounts.json'));
    try {
        accounts = JSON.parse(accountsFileContents);
    }
    catch (e) {
        console.error('Error: Unable to parse accounts.json');
        console.error('Reason:', e);
        process.exit(1);
    }
    return Object.keys(accounts);
}

function accountNamesToFullyQualifiedDomainNames(accountNames: Array<string>, serviceName: string, namespace: string) {
    return accountNames.map(accountName => {
        return Naming.fullyQualifiedDomainName(accountName, serviceName, namespace)
    })
}

function accountNamesToServiceDomainNames(accountNames: Array<string>, serviceName: string) {
    return accountNames.map(accountName => {
        return `${Naming.toDNS1123(accountName)}.${Naming.toDNS1123(serviceName)}`
    })
}

export {
    getAccountNamesFromFileSystem,
    accountNamesToFullyQualifiedDomainNames,
    accountNamesToServiceDomainNames
};
import * as Path from 'path';
import * as fs from 'fs-extra';
import DeveloperAccount from './developer';
import FullAccount from './full'
import ParticipantAccount from './participant';
import RootAccount from './root';
import ValidatorAccount from './validator';
import UnknownAccount from './unknown';
import IAccount from "./iaccount";
import AccountRepresentation from "./representation";

const accountTypes = [DeveloperAccount, FullAccount, ParticipantAccount, RootAccount, ValidatorAccount];

function getAccountForPath(path: string): IAccount {
    for (let index = 0; index < accountTypes.length; index++) {
        const AccountType = accountTypes[index];
        if (AccountType.pathMatchesType(path)) {
            return new AccountType(Path.basename(path), path);
        }
    }

    return new UnknownAccount();
}

function getAccountsFromPath(accountNames: string[], path: string): IAccount[] {
    return accountNames.map(accountName => {
        return getAccountForPath(Path.join(path, accountName));
    });
}

function getRepresentationsForAccounts(accounts: IAccount[]): AccountRepresentation[] {
    return accounts.map(account => {
        return account.toJSON();
    });
}

function getAccountRepresentationsFromPath(path: string): AccountRepresentation[] {
    const accountNames = getAccountNamesFromFileSystem(path);
    const accounts = getAccountsFromPath(accountNames, path);
    return getRepresentationsForAccounts(accounts);
}

function getAccountNamesFromFileSystem(path: string): Array<string> {
    let accounts = {};
    const accountsFileContents = fs.readFileSync(Path.join(path, 'accounts.json'));
    try {
        accounts = JSON.parse(accountsFileContents.toString());
    }
    catch (e) {
        console.error('Error: Unable to parse accounts.json');
        console.error('Reason:', e);
        process.exit(1);
    }
    return Object.keys(accounts);
}

export {getAccountForPath, getAccountsFromPath, getRepresentationsForAccounts, getAccountRepresentationsFromPath};
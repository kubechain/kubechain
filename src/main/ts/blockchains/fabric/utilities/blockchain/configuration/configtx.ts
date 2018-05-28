import * as YamlJs from "yamljs";
import * as Inquirer from "inquirer";

export default class ConfigTx {
    private configuration: any;

    constructor(path: string) {
        this.configuration = YamlJs.load(path);
    }

    async promptUserForProfile() {
        const answers: any = await Inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'profile',
                    message: 'Which profile do you want to use?',
                    choices: this.profilesToArray(),
                }
            ]);
        return Promise.resolve(answers["profile"]);
    }

    private profilesToArray(): string[] {
        return Object.keys(this.configuration.Profiles);
    }
}
const shell = require('shelljs');

class ShellCommand {
    /**
     * @desc Wraps shelljs exec function in a Promise.
     * @param {string} command - Command to execute.
     * @return {Promise}
     */

    static executeCommand(command, options) {
        return new Promise(function (resolve, reject) {
            shell.exec(command, options, (code, stdout, stderr) => {
                if (ShellCommand.isExecutionError(code)) {
                    reject(stderr)
                }
                else {
                    resolve(stdout);
                }
            })
        });
    }

    static isExecutionError(code) {
        return code !== 0;
    }
}

module.exports = ShellCommand;
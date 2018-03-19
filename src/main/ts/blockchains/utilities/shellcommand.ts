import * as Shell from 'shelljs';

/**
 * @desc Wraps shelljs exec function in a Promise.
 * @param {string} command - Command to execute.
 * @return {Promise}
 */

function executeCommand(command: string, options: {}) {
    return new Promise(function (resolve, reject) {
        Shell.exec(command, options, (code: number, stdout: string, stderr: string) => {
            if (isExecutionError(code)) {
                reject(stderr)
            }
            else {
                resolve(stdout);
            }
        })
    });
}

function isExecutionError(code: number) {
    return code !== 0;
}

export {executeCommand};
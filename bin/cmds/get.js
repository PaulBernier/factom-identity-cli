#!/usr/bin/env node

const ora = require('ora'),
    chalk = require('chalk'),
    { FactomIdentityManager } = require('factom-identity-lib'),
    { getConnectionInformation } = require('../../src/util');

exports.command = 'get <rchainid>';
exports.describe = 'Get identity information.';

exports.builder = function (yargs) {
    return yargs.option('socket', {
        alias: 's',
        type: 'string',
        describe: 'IPAddress:port of factomd API.',
        default: 'localhost:8088'
    }).option('history', {
        alias: 'h',
        type: 'boolean',
        describe: 'IPAddress:port of factomd API.'
    }).positional('rchainid', {
        describe: 'Identity root chain id.'
    });
};

exports.handler = async function (argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const manager = new FactomIdentityManager(factomdInformation);

    let spinner;
    console.error('');
    if (argv.history) {
        spinner = ora(`Retrieving historical information of identity ${chalk.yellow.bold(argv.rchainid)}...`).start();
        try {
            const result = await manager.getIdentityInformationHistory(argv.rchainid);
            spinner.succeed();
            console.error('');
            console.log(JSON.stringify(result, null, 4));
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red.bold(message));
        }
    } else {
        spinner = ora(`Retrieving latest information of identity ${chalk.yellow.bold(argv.rchainid)}...`).start();
        try {
            const result = await manager.getIdentityInformation(argv.rchainid);
            spinner.succeed();
            console.error('');
            console.log(JSON.stringify(result, null, 4));
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red.bold(message));
        }
    }
    console.error('');

};
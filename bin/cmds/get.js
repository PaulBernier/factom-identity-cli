#!/usr/bin/env node

const ora = require('ora'),
    chalk = require('chalk'),
    { FactomServerIdentityManager } = require('factom-identity-lib').server,
    { getConnectionInformation } = require('../../src/util');

exports.command = 'get <rchainid>';
exports.describe = 'Get identity information.';

exports.builder = function (yargs) {
    return yargs.option('socket', {
        alias: 's',
        type: 'string',
        describe: 'factomd API endpoint.',
        default: 'http://localhost:8088/v2'
    }).option('history', {
        alias: 'h',
        type: 'boolean',
        describe: 'IPAddress:port of factomd API.'
    }).positional('rchainid', {
        describe: 'Identity root chain id.'
    });
};

exports.handler = async function (argv) {
    const factomdInformation = getConnectionInformation(argv.socket);
    const manager = new FactomServerIdentityManager(factomdInformation);

    let spinner;
    console.error('');
    if (argv.history) {
        spinner = ora(`Retrieving historical information of identity ${chalk.yellow.bold(argv.rchainid)}...`).start();
        try {
            const result = await manager.getServerIdentityHistory(argv.rchainid);
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
            const result = await manager.getServerIdentity(argv.rchainid);
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
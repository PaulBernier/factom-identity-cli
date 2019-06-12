#!/usr/bin/env node

const ora = require('ora'),
    chalk = require('chalk'),
    { FactomServerIdentityManager  } = require('factom-identity-lib').server,
    { generateUpdateEfficiencyScript } = require('../../src/generate-script'),
    { getConnectionInformation } = require('../../src/util');

exports.command = 'update-efficiency <rchainid> <efficiency> <sk1> <secaddress> [smchainid]';
exports.describe = 'Update efficiency or generate a script to update efficiency.';

exports.builder = function (yargs) {
    return yargs.option('socket', {
        alias: 's',
        describe: 'factomd API endpoint.',
        default: 'http://localhost:8088/v2'
    }).option('offline', {
        describe: 'Generate offline a script to be excuted at a later time on a machine connected to the Internet.',
        type: 'boolean'
    }).positional('rchainid', {
        describe: 'Identity root chain id.'
    }).positional('efficiency', {
        describe: 'Efficiency value. Decimal number between 0 and 100.',
        type: 'number'
    }).positional('sk1', {
        describe: 'Secret level 1 key (starts with sk1...) to sign the update.'
    }).positional('secaddress', {
        describe: 'Private EC address (starts with Es...) to pay the update.'
    }).positional('smchainid', {
        describe: 'Identity server management subchain id (only for offline mode).'
    });
};

exports.handler = async function (argv) {
    const factomdInformation = getConnectionInformation(argv.socket);
    const manager = new FactomServerIdentityManager(factomdInformation);

    let spinner;
    console.error('');
    if (argv.offline) {
        if (!argv.smchainid) {
            return console.error(chalk.red.bold('Server Management Subchain Id needs to be specified as the last (5th) argument in offline mode'));
        }

        try {
            console.error(chalk.bgBlue.bold('  INFO  ') + ' Remember to always verify that the clock of your computer is synced when using the offline mode (see README for the reasons).\n');
            spinner = ora(`Generating script to update Identity ${chalk.yellow.bold(argv.rchainid)} with an efficiency of ${chalk.yellow.bold(argv.efficiency)}...`).start();

            const filename = generateUpdateEfficiencyScript(argv.rchainid, argv.smchainid, argv.efficiency, argv.sk1, argv.secaddress, factomdInformation);
            spinner.succeed();
            console.error(`Execute ${chalk.yellow.bold(filename)} script on a machine with curl command and an Internet connection.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red.bold(message));
        }

    } else {
        spinner = ora(`Updating Identity ${chalk.yellow.bold(argv.rchainid)} with an efficiency of ${chalk.yellow.bold(argv.efficiency)}...`).start();

        try {
            const data = await manager.updateEfficiency(argv.rchainid, argv.efficiency, argv.sk1, argv.secaddress);
            spinner.succeed();
            console.error(`Please wait for the next block to see the effect. Entry hash of the update: ${chalk.yellow.bold(data.entryHash)}.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red.bold(message));
        }
    }
    console.error('');
};
#!/usr/bin/env node

const ora = require('ora'),
    chalk = require('chalk'),
    { FactomServerIdentityManager  } = require('factom-identity-lib').server,
    { generateAddCoinbaseCancelScript } = require('../../src/generate-script'),
    { getConnectionInformation } = require('../../src/util');

exports.command = 'add-coinbase-cancel <rchainid> <height> <index> <sk1> <secaddress> [smchainid]';
exports.describe = 'Add a coinbase cancel message to an identity.';

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
    }).positional('height', {
        describe: 'Block height containing the Admin block with the output to cancel.',
        type: 'number'
    }).positional('index', {
        describe: 'Index in the coinbase descriptor of the specific output to be canceled (0 origin indexed).',
        type: 'number'
    }).positional('sk1', {
        describe: 'Secret level 1 key (starts with sk1...) to sign the message.'
    }).positional('secaddress', {
        describe: 'Private EC address (starts with Es...) to pay the message.'
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
            return console.error(chalk.red('Server Management Subchain Id needs to be specified as the last (6th) argument in offline mode'));
        }

        try {
            console.error(chalk.bgBlue.bold('  INFO  ') + ' Remember to always verify that the clock of your computer is synced when using the offline mode (see README for the reasons).\n');
            spinner = ora(`Generating script to add a cancel coinbase message for height ${chalk.yellow(argv.height)} and index ${chalk.yellow(argv.index)} to Identity ${chalk.yellow(argv.rchainid)}...`).start();

            const filename = generateAddCoinbaseCancelScript(argv.rchainid, argv.smchainid, argv.height, argv.index, argv.sk1, argv.secaddress, factomdInformation);

            spinner.succeed();
            console.error(`Execute ${chalk.yellow(filename)} script on a machine with curl command and an Internet connection.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red(message));
        }

    } else {
        spinner = ora(`Adding coinbase cancel message for height ${chalk.yellow(argv.height)} and index ${chalk.yellow(argv.index)} to Identity ${chalk.yellow(argv.rchainid)}...`).start();

        try {
            const data = await manager.addCoinbaseCancel(argv.rchainid, argv.height, argv.index, argv.sk1, argv.secaddress);
            spinner.succeed();
            console.error(`Please wait for the next block to see the effect. Entry hash of the update: ${chalk.yellow(data.entryHash)}.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red(message));
        }
    }
    console.error('');

};
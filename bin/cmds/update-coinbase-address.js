#!/usr/bin/env node

const ora = require('ora'),
    chalk = require('chalk'),
    { FactomServerIdentityManager  } = require('factom-identity-lib').server,
    { generateUpdateCoinbaseAddressScript } = require('../../src/generate-script'),
    { getConnectionInformation } = require('../../src/util');

exports.command = 'update-coinbase-address <rchainid> <fctaddress> <sk1> <secaddress>';
exports.describe = 'Update coinbase address or generate a script to update coinbase address.';

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
    }).positional('fctaddress', {
        describe: 'Public Factoid address (starts with FA...) that will receive coinbase payouts.'
    }).positional('sk1', {
        describe: 'Secret level 1 key (starts with sk1...) to sign the update.'
    }).positional('secaddress', {
        describe: 'Private EC address (starts with Es...) to pay the update.'
    });
};

exports.handler = async function (argv) {
    const factomdInformation = getConnectionInformation(argv.socket);
    const manager = new FactomServerIdentityManager(factomdInformation);

    let spinner;
    console.error('');
    if (argv.offline) {
        try {
            console.error(chalk.bgBlue.bold('  INFO  ') + ' Remember to always verify that the clock of your computer is synced when using the offline mode (see README for the reasons).\n');
            spinner = ora(`Generating script to update Identity ${chalk.yellow(argv.rchainid)} with coinbase address ${chalk.yellow(argv.fctaddress)}...`).start();

            const filename = generateUpdateCoinbaseAddressScript(argv.rchainid, argv.fctaddress, argv.sk1, argv.secaddress, factomdInformation);
            
            spinner.succeed();
            console.error(`Execute ${chalk.yellow(filename)} script on a machine with curl command and an Internet connection.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red(message));
        }
    } else {
        spinner = ora(`Updating Identity ${chalk.yellow(argv.rchainid)} with coinbase address address ${chalk.yellow(argv.fctaddress)}...`).start();

        try {
            const data = await manager.updateCoinbaseAddress(argv.rchainid, argv.fctaddress, argv.sk1, argv.secaddress);
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
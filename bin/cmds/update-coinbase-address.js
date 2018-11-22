#!/usr/bin/env node

const ora = require('ora'),
    chalk = require('chalk'),
    { FactomIdentityManager } = require('factom-identity-lib'),
    { generateUpdateCoinbaseAddressScript } = require('../../src/generate-script'),
    { getConnectionInformation } = require('../../src/util');

exports.command = 'update-coinbase-address <rchainid> <fctaddress> <sk1> <secaddress>';
exports.describe = 'Update coinbase address or generate a script to update coinbase address.';

exports.builder = function (yargs) {
    return yargs.option('socket', {
        alias: 's',
        describe: 'IPAddress:port of factomd API.',
        default: 'localhost:8088'
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
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const manager = new FactomIdentityManager(factomdInformation);

    let spinner;
    console.error('');
    if (argv.offline) {
        try {
            console.error(chalk.blue.bold('Remember to always verify that the clock of your computer is synced when using the offline mode (see README for the reasons).'));
            spinner = ora(`Generating script to update Identity ${chalk.yellow.bold(argv.rchainid)} with coinbase address ${chalk.yellow.bold(argv.fctaddress)}...`).start();

            const filename = generateUpdateCoinbaseAddressScript(argv.rchainid, argv.fctaddress, argv.sk1, argv.secaddress, factomdInformation);
            
            spinner.succeed();
            console.error(`Execute ${chalk.yellow.bold(filename)} script on a machine with curl command and an Internet connection.`);
        } catch (e) {
            const message = e instanceof Error ? e.message : e;
            spinner.fail();
            console.error(chalk.red.bold(message));
        }
    } else {
        spinner = ora(`Updating Identity ${chalk.yellow.bold(argv.rchainid)} with coinbase address address ${chalk.yellow.bold(argv.fctaddress)}...`).start();

        try {
            const data = await manager.updateCoinbaseAddress(argv.rchainid, argv.fctaddress, argv.sk1, argv.secaddress);
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
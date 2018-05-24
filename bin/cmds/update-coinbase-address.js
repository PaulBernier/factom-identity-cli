#!/usr/bin/env node

const { updateCoinbaseAddress, generateUpdateCoinbaseAddressScript } = require('../../src/update'), { getConnectionInformation } = require('../../src/util');

exports.command = 'update-coinbase-address <rchainid> <fctaddress> <sk1> <secaddress>';
exports.describe = 'Update coinbase address or generate a script to update coinbase address.';

exports.builder = function(yargs) {
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

exports.handler = function(argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const { FactomCli } = require('factom');
    const cli = new FactomCli(factomdInformation);

    if (argv.offline) {
        console.log(`Generating script to update coinbase address of Identity [${argv.rchainid}] with [${argv.fctaddress}]...`);
        generateUpdateCoinbaseAddressScript(argv.rchainid, argv.fctaddress, argv.sk1, argv.secaddress, factomdInformation);
        console.log('Script to update coinbase address generated. Execute "update-coinbase-address.sh" script on a machine with curl command and an Internet connection.');

    } else {

        console.log(`Updating coinbase address of Identity [${argv.rchainid}] with address [${argv.fctaddress}]...`);
        updateCoinbaseAddress(cli, argv.rchainid, argv.fctaddress, argv.sk1, argv.secaddress)
            .then(function(data) {
                console.log(`Coinbase address successfully updated. Please wait for the next block to see the effect. Entry hash of the update: ${data.entryHash}`);
            })
            .catch(console.error);

    }
};
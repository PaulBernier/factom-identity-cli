#!/usr/bin/env node

const colors = require('colors'),
    { FactomIdentityManager } = require('factom-identity-lib'),
    { generateAddCoinbaseCancelScript } = require('../../src/generate-script'),
    { getConnectionInformation } = require('../../src/util');

exports.command = 'add-coinbase-cancel <rchainid> <height> <index> <sk1> <secaddress> [smchainid]';
exports.describe = 'Add a coinbase cancel message to an identity.';

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

exports.handler = function(argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const manager = new FactomIdentityManager(factomdInformation);

    if (argv.offline) {
        try {
            if (!argv.smchainid) {
                throw new Error('Server Management Subchain Id needs to be specified as a 5th argument in offline mode');
            }

            console.log(`Generating script to add a cancel coinbase message for height ${argv.height} and index ${argv.index} to Identity [${argv.rchainid}]...`);
            generateAddCoinbaseCancelScript(argv.rchainid, argv.smchainid, argv.height, argv.index, argv.sk1, argv.secaddress, factomdInformation);
            console.log('Script to add coinbase cancel message generated. Execute "add-coinbase-cancel.sh" script on a machine with curl command and an Internet connection.');
        } catch (e) {
            console.error(colors.red(`Error: ${e.message}`));
        }
    } else {
        console.log(`Adding coinbase cancel message for height ${argv.height} and index ${argv.index} to Identity [${argv.rchainid}]...`);
        manager.addCoinbaseCancel(argv.rchainid, argv.height, argv.index, argv.sk1, argv.secaddress)
            .then(function(data) {
                console.log(`Coinbase cancel message successfully added. Please wait for the next block to see the effect. Entry hash of the message: ${data.entryHash}`);
            })
            .catch(e => console.error(colors.red(`Error: ${e.message}`)));
    }
};
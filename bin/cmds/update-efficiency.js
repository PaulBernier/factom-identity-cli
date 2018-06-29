#!/usr/bin/env node

const { FactomIdentityManager } = require('factom-identity-lib'), { generateEfficiencyUpdateScript } = require('../../src/generate-script'), { getConnectionInformation } = require('../../src/util');

exports.command = 'update-efficiency <rchainid> <efficiency> <sk1> <secaddress> [smchainid]';
exports.describe = 'Update efficiency or generate a script to update efficiency.';

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

exports.handler = function(argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const manager = new FactomIdentityManager(factomdInformation);

    if (argv.offline) {
        if (!argv.smchainid) {
            throw new Error('Server Management Subchain Id needs to be specified as a 5th argument in offline mode');
        }
        console.log(`Generating script to update efficiency of Identity [${argv.rchainid}] with efficiency [${argv.efficiency}]...`);
        generateEfficiencyUpdateScript(argv.rchainid, argv.smchainid, argv.efficiency, argv.sk1, argv.secaddress, factomdInformation);
        console.log('Script to update effiency generated. Execute "update-efficiency.sh" script on a machine with curl command and an Internet connection.');

    } else {
        console.log(`Updating efficiency of Identity [${argv.rchainid}] with efficiency [${argv.efficiency}]...`);
        manager.updateEfficiency(argv.rchainid, argv.efficiency, argv.sk1, argv.secaddress)
            .then(function(data) {
                console.log(`Efficiency successfully updated. Please wait for the next block to see the effect. Entry hash of the update: ${data.entryHash}`);
            })
            .catch(console.error);
    }
};
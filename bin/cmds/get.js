#!/usr/bin/env node

const { FactomIdentityManager } = require('factom-identity-lib'),
    { getConnectionInformation, printError } = require('../../src/util');

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

exports.handler = function (argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const manager = new FactomIdentityManager(factomdInformation);

    if (argv.history) {
        console.log(`Retrieving historical information of identity [${argv.rchainid}]...`);
        manager.getIdentityInformationHistory(argv.rchainid)
            .then(console.log)
            .catch(printError);
    } else {
        console.log(`Retrieving information of identity [${argv.rchainid}]...`);
        manager.getIdentityInformation(argv.rchainid)
            .then(console.log)
            .catch(printError);
    }
};
#!/usr/bin/env node

const { getIdentityInformation, getIdentityInformationHistory } = require('../../src/get'), { getConnectionInformation } = require('../../src/util');

exports.command = 'get <rchainid>';
exports.describe = 'Get identity information.';

exports.builder = function(yargs) {
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

exports.handler = function(argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const { FactomCli } = require('factom');
    const cli = new FactomCli(factomdInformation);

    if (argv.history) {
        console.log(`Retrieving historical information of identity [${argv.rchainid}]...`);
        getIdentityInformationHistory(cli, argv.rchainid)
            .then(console.log)
            .catch(console.error);
    } else {
        console.log(`Retrieving information of identity [${argv.rchainid}]...`);
        getIdentityInformation(cli, argv.rchainid)
            .then(console.log)
            .catch(console.error);
    }
};
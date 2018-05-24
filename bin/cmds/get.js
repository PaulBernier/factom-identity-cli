#!/usr/bin/env node

const { getIdentityInformation } = require('../../src/get'), { getConnectionInformation } = require('../../src/util');

exports.command = 'get <rchainid>';
exports.describe = 'Get identity information.';

exports.builder = function(yargs) {
    return yargs.option('socket', {
        alias: 's',
        type: 'string',
        describe: 'IPAddress:port of factomd API.',
        default: 'localhost:8088'
    }).positional('rchainid', {
        describe: 'Identity root chain id.'
    });
};


exports.handler = function(argv) {
    const factomdInformation = getConnectionInformation(argv.socket, 8088);
    const { FactomCli } = require('factom');
    const cli = new FactomCli(factomdInformation);

    console.log(`Retrieving information of identity [${argv.rchainid}]...`);
    getIdentityInformation(cli, argv.rchainid)
        .then(console.log)
        .catch(console.error);
};
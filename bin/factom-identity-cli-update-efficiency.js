#!/usr/bin/env node

const program = require('commander'),
    { updateEfficiency, generateUpdateEfficiencyScript } = require('../src/update'),
    { getConnectionInformation } = require('../src/util');

program
    .usage('[options] <Identity root chain ID> <Efficiency> <SK1 private key> <Paying private EC address> <Server Management Subchain ID (only for offline mode)>')
    .description('Update efficiency or generate a script to update efficiency')
    .option('--offline', 'Generate offline a script to be excuted at a later time on a machine connected to the Internet.')
    .option('-s, --socket <socket>', 'IPAddress:port of factomd API (default localhost:8088)')
    .parse(process.argv);

program.on('--help', function() {
    console.log('\n  Examples:\n');
    console.log('    $ factom-identity-cli update-efficiency -s localhost:8088 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f 19.89 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW\n');
    console.log('    $ factom-identity-cli update-efficiency --offline -s localhost:8088 8888889822cf1d5889aa8dc11ad210b67d582812152de568fabc5f8505989c0f 19.89 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW 8888887c01c12c72052f9c99b45782013feadb20c46ca86dc6e3a9730835848a\n');
});

if (!program.args[0]) {
    program.outputHelp();
    process.exit(1);
}

const factomdInformation = getConnectionInformation(program.socket, 8088);

const { FactomCli } = require('factom');

const cli = new FactomCli(factomdInformation);

const rootChainId = program.args[0];
const efficiency = parseFloat(program.args[1]);
const sk1 = program.args[2];
const ecPrivateAddress = program.args[3];
const serverManagementSubchainId = program.args[4];

if (program.offline) {
    if (!serverManagementSubchainId) {
        throw new Error('Server Management Subchain Id needs to be specified as a 5th argument in offline mode');
    }
    console.log(`Generating script to update efficiency of Identity [${rootChainId}] with efficiency [${efficiency}]...`);
    generateUpdateEfficiencyScript(rootChainId, serverManagementSubchainId, efficiency, sk1, ecPrivateAddress, factomdInformation);
    console.log('Script to update effiency generated. Execute "update-efficiency.sh" script on a machine with curl command and an Internet connection.');

} else {
    console.log(`Updating efficiency of Identity [${rootChainId}] with efficiency [${efficiency}]...`);
    updateEfficiency(cli, rootChainId, efficiency, sk1, ecPrivateAddress)
        .then(function(data) {
            console.log(`Efficiency successfully updated. Please wait for the next block to see the effect. Entry hash of the update: ${data.entryHash}`);
        })
        .catch(console.error);
}
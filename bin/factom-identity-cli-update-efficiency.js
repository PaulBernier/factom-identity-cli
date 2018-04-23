const program = require('commander'),
    { updateEfficiency } = require('../src/update'),
    { getConnectionInformation } = require('../src/util');

program
    .usage('[options] <Identity root chain ID> <Efficiency> <SK1 private key> <Paying private EC address>')
    .description('Update efficiency')
    .option('-s, --socket <socket>', 'IPAddress:port of factomd API (default localhost:8088)')
    .parse(process.argv);

program.on('--help', function() {
    console.log('\n  Examples:\n');
    console.log('    $ factom-identity-cli update-efficiency -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584 19.89 sk12J1qQCjTRtnJ15bmb1iSinEvtzgQMBi5szzV793LUJQib36pvz Es3ytEKt4R55M9juC4ks7EgxQSX8BpRnM4WADthFoq7j1WgbEEGW\n');
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

console.log(`Updating efficiency of Identity [${rootChainId}] with efficiency [${efficiency}]...`);
updateEfficiency(cli, rootChainId, efficiency, sk1, ecPrivateAddress)
    .then(function(data) {
        console.log(`Efficiency successfully updated. Please wait for the next block to see the effect. Entry hash of the update: ${data.entryHash}`);
    })
    .catch(console.error);
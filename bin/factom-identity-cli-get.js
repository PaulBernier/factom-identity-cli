const program = require('commander'),
    { getIdentityInformation } = require('../src/get'),
    { getConnectionInformation } = require('../src/util');

program
    .usage('[options] <Identity root chain ID>')
    .description('Get identity information')
    .option('-s, --socket <socket>', 'IPAddress:port of factomd API (default localhost:8088)')
    .parse(process.argv);

program.on('--help', function() {
    console.log('\n  Examples:\n');
    console.log('    $ factom-identity-cli get -s localhost:8088 888888b2e7c7c63655fa85e0b0c43b4b036a6bede51d38964426f122f61c5584\n');
});

if (!program.args[0]) {
    program.outputHelp();
    process.exit(1);
}

const factomdInformation = getConnectionInformation(program.socket, 8088);

const { FactomCli } = require('factom');

const cli = new FactomCli(factomdInformation);

getIdentityInformation(cli, program.args[0])
    .then(console.log)
    .catch(console.error);
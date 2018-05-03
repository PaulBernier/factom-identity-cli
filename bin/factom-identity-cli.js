#!/usr/bin/env node

const program = require('commander');

program
    .description('Read and update Factom identities')
    .command('get', 'Get identity information')
    .command('update-coinbase-address', 'Update coinbase address')
    .command('update-efficiency', 'Update efficiency')
    .parse(process.argv);

if (!['get', 'update-coinbase-address', 'update-efficiency'].includes(program.args[0])) {
    console.error(`Invalid command [${program.args[0]}]`);
    program.outputHelp();
    process.exit(1);
}
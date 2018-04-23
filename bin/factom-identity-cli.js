#!/usr/bin/env node

const program = require('commander');

program
    .description('Read and update Factom identities')
    .command('get', 'Get identity information')
    .command('update-coinbase-address', 'Update coinbase address')
    .command('update-efficiency', 'Update efficiency')
    .parse(process.argv);
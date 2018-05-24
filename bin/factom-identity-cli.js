#!/usr/bin/env node

const yargs = require('yargs');
yargs.strict()
    .wrap(yargs.terminalWidth())
    .commandDir('cmds')
    .demandCommand(1)
    .argv;

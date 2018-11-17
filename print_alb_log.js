#!/usr/bin/node

'use strict';

const readline = require('readline');
const getOpt = require('node-getopt');

const logic = require('./libs/logic');

const opts = getOpt.create([
  ['f', 'format=ARG', 'Format string'],
]).parseSystem();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const formatString = opts.options.format;

rl.on('line', (line) => {
  logic.processLine(line, formatString);
});


'use strict';

const parseLog = require('alb-log-parser');
const formatParser = require('./format_parser');

const printFormattedLine = (lineObj, formatString) => {
  const result = formatParser.parse(formatString, lineObj);
  console.log(result);
};

module.exports = {
  processLine: (line, formatString) => {
    const obj = parseLog(line);
    printFormattedLine(obj, formatString);
  },
};
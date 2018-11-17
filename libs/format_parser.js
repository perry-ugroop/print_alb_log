'use strict';

const ST_NORMAL = 0;
const ST_EOS = 1;
const ST_DOLLAR = 2;
const ST_CURLY_BEGIN = 3;
const ST_DOLLAR_VAR = 4;
const ST_CURLY_VAR = 5;
const ST_CURLY_END = 6;

const isAtEndOfString = (i, len) => (i >= len);

const isLetter = (ch) => (('A' <= ch && ch <= 'Z') || ('a' <= ch && ch <= 'z'));

const isNumber = (ch) => ('0' <= ch && ch <= '9');

const getCharAt = (formatString, i, len) => ( i < len ? formatString[i] : '');

const transferAll = (destArr, srcArr) => {
  while (srcArr.length > 0) {
    destArr.push(srcArr.shift());
  }
};

const outputToString = (s) => (((typeof (s) !== 'undefined') && (s !== null)) ? s.toString() : '');

const pushString = (destArr, src) => {
  for (let i = 0; i < src.length; i += 1) {
    destArr.push(src[i]);
  }
};

module.exports = {
  parse: (formatString, valueObj) => {
    const len = formatString.length;

    let i = 0;
    let out = [];
    let status = ST_NORMAL;
    let ch;
    let previousChars = [];
    let varout;
    let varname;

    if (isAtEndOfString(i, len)) {
      status = ST_EOS;
    }

    while (true) {
      if (status === ST_EOS) {
        break;
      }

      ch = getCharAt(formatString, i, len);

      switch (status) {
        case ST_DOLLAR:
          if (isAtEndOfString(i, len)) {
            transferAll(out, previousChars);
            i -= 1;
            status = ST_EOS;
          } else if (ch === '{') {
            previousChars.push(ch);
            status = ST_CURLY_BEGIN;
          } else if (ch === '$') {
            transferAll(out, previousChars);
            status = ST_NORMAL;
          } else if (!isLetter(ch) && ch !== '_') {
            throw new Error(`Unexpected character at index ${i}: '${ch}'`);
          } else {
            status = ST_DOLLAR_VAR;
            varout = [];
            i -= 1;
          }
          break;

        case ST_DOLLAR_VAR:
          if (isAtEndOfString(i, len)) {
            varname = varout.join('');
            pushString(out, outputToString(valueObj[varname]));
            status = ST_NORMAL;
            i -= 1;
          } else if(!isLetter(ch) && !isNumber(ch) && ch !== '_') {
            varname = varout.join('');
            pushString(out, outputToString(valueObj[varname]));
            status = ST_NORMAL;
            i -= 1;
          } else {
            varout.push(ch);
            status = ST_DOLLAR_VAR;
          }
          break;

        case ST_CURLY_BEGIN:
          if (isAtEndOfString(i, len)) {
            transferAll(out, previousChars);
            i -= 1;
            status = ST_EOS;
          } else if (!isLetter(ch) && ch !== '_') {
            transferAll(out, previousChars);
            i -= 1;
            status = ST_NORMAL;
          } else {
            status = ST_CURLY_VAR;
            varout = [];
            i -= 1;
          }
          break;

        case ST_CURLY_VAR:
          if (isAtEndOfString(i, len)) {
            varname = varout.join('');
            pushString(out, outputToString(valueObj[varname]));
            status = ST_NORMAL;
            i -= 1;
          } else if(ch === '}') {
            varname = varout.join('');
            pushString(out, outputToString(valueObj[varname]));
            status = ST_CURLY_END;
            i -= 1;
          } else if(!isLetter(ch) && !isNumber(ch) && ch !== '_') {
            throw new Error(`Unexpected character at index ${i}: '${ch}'`);
          } else {
            varout.push(ch);
            status = ST_CURLY_VAR;
          }
          break;

        case ST_CURLY_END:
          status = ST_NORMAL;
          break;

        default: // case ST_NORMAL
          if (isAtEndOfString(i, len)) {
            status = ST_EOS;
          } else {
            if (ch === '$') {
              previousChars.push(ch);
              status = ST_DOLLAR;
            } else {
              out.push(ch);
              status = ST_NORMAL;
            }
          }
          break;
      }

      i += 1;
    }

    return out.join('');
  },
};

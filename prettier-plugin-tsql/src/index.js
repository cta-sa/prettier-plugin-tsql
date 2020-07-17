const parse = require("./parse");
const print = require("./print");

/*
 * metadata pulled from linguist:
 * https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
 */

module.exports = {
  languages: [
    {
      name: "TSql",
      parsers: ["tsql"],
      extensions: [".sql"],
      vscodeLanguageIds: ["sql"],
    },
  ],
  parsers: {
    tsql: {
      parse,
      astFormat: "tsql",
    },
  },
  printers: {
    tsql: {
      print,
    },
  },
  options: {},
  defaultOptions: {
    printWidth: 178,
    tabWidth: 2,
  },
};

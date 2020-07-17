const { spawnSync } = require("child_process");
const path = require("path");

module.exports = (text, _parsers, _opts) => {
  const child = spawnSync(
    path.join(
      __dirname,
      "..\\..\\parser\\bin\\Debug\\netcoreapp3.1\\SQLFormat.exe"
    ),
    [text]
  );

  const response = JSON.parse(child.stdout.toString());

  if (response.error) throw new Error(response.error);

  return response;
};

const crypto = require("crypto");
const { dialog } = require("electron");
const fs = require("fs");
const sudo = require("sudo-prompt");
const IS_LINUX = require("os").platform() === "linux";

const ruleContent = `KERNEL=="hidraw*", SUBSYSTEM=="hidraw", MODE="0666", TAG+="uaccess", TAG+="udev-acl"`;
const correctHash = genMD5(ruleContent);
const rulePath = "/etc/udev/rules.d/92-viia.rules";
const cmd = `printf '${ruleContent}' > ${rulePath} && udevadm control --reload-rules && udevadm trigger`;
const messageOptions = {
  type: "question",
  buttons: ["Cancel", "Continue"],
  defaultId: 2,
  title: "",
  message: "Allow SnailKM Access",
  detail:
    "In order to communicate with your keyboard we need to add a udev rule which requires root permissions. Continue?",
};

function genMD5(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}

function fileIsInvalid(hash, path) {
  console.log(hash);
  return (
    !fs.existsSync(path) ||
    genMD5(fs.readFileSync(path, { encoding: "utf8" })) !== hash
  );
}

async function checkAccess(app) {
  if (
    !process.env.DISABLE_SUDO_PROMPT &&
    IS_LINUX &&
    fileIsInvalid(correctHash, rulePath)
  ) {
    return new Promise((res, rej) => {
      return dialog.showMessageBox(null, messageOptions).then((result) => {
        const { response } = result;
        if (response === 0) {
          app.quit();
        } else {
          sudo.exec(cmd, { name: "SnailKM" }, (err, out) =>
            err ? rej(err) : res(out)
          );
        }
        return 0;
      });
    });
  }
  return Promise.resolve({});
}

exports.checkAccess = checkAccess;

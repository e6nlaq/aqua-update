
const fetch = require('node-fetch');
const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');
const args = process.argv;

var download = function (uri, filename) {
	return new Promise(function (resolve, reject) {
		return https
			.request(uri, function (res) {
				res
					.pipe(fs.createWriteStream(filename))
					.on("close", resolve)
					.on("error", reject);
			})
			.end();
	});
};

async function main() {

	if (process.platform === "win32") {
		console.log("Not available for Windows.");
		return;
	}

	let res = await fetch("https://api.github.com/repos/e6nlaq/aqua/releases");
	let vdat = await res.json();

	let name = "";
	let tag = "";
	let version = 0.0;

	let nowstd = execSync("aqua --version");
	let nowver = parseFloat(nowstd.toString());

	switch (args[2]) {
		case "latest":
			for (let i = 0; i < 10; i++) {
				if (!vdat[i]["prerelease"]) {
					name = vdat[i]["name"];
					tag = vdat[i]["tag_name"];
					break;
				}
			}
			break;

		case "preview":
			name = vdat[0]["name"];
			tag = vdat[0]["tag_name"];

			break;

		default:
			console.log(`Unknown version: ${args[2]}`);
			return;
	}

	let tmp = tag.replace('-pre', '');
	tmp = tmp.replace(/(.*)\./, '$1');
	tmp = tmp.substring(1);

	version = parseFloat(tmp);

	if (nowver >= version) {
		console.log("The latest Aqua is installed.");
		return;
	} else {
		console.log("==============================================");
		console.log("New versions of Aqua are available!");
		console.log(`Build ${nowver} => ${name}`);
		console.log("==============================================");
	}

	let url = "https://example.com";

	switch (process.platform) {
		case 'linux':
		case 'android':
			url = `https://github.com/e6nlaq/aqua/releases/download/${tag}/install-linux.sh`;
			break;

		default:
			url = `https://github.com/e6nlaq/aqua/archive/refs/tags/${tag}.tar.gz`;
			break;
	}

	execSync(`wget ${url}`);

	if (process.platform === 'linux' || process.platform === 'android') {
		execSync("chmod +x install-linux.sh && ./install-linux.sh");
	}

}
main();

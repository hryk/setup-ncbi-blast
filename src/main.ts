import * as core from "@actions/core";
import * as github from "@actions/github";
import * as httpm from "@actions/http-client";
import installer from "installer";

const resolveBLASTVersion = function () {
  let version = core.getInput("blast-version");
  if (version === "latest" || !version) {
    // get latest version number
    const blastVersionURL =
      "https://ftp.ncbi.nlm.nih.gov/blast/executables/blast+/VERSION";
    const http = new httpm.HttpClient("setup-blast-action");
    let res: httpm.HttpClientResponse = await http.get(blastVersionURL);
    if (res.message.statusCode === 200) {
      let body: string = await res.readBody();
      version = body.trim();
    } else {
      core.error("Download BLAST version failed.");
    }
  }
  return version;
};

export async function run() {
  try {
    // `who-to-greet` input defined in action metadata file
    const blastVersion = resolveBLASTVersion();
    core.info(`Install NCBI BLAST+ version ${blastVersion}`);

    installer.installBlast(version);

    const time = new Date().toTimeString();
    core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

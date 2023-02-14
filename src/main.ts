import * as core from "@actions/core";
//import * as github from "@actions/github";
import * as httpm from "@actions/http-client";
import * as installer from "./installer";

const resolveBLASTVersion = async function () {
  let version = core.getInput("blast-version");
  core.info(`NCBI BLAST+ version ${version} requested`);
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
    const blastVersion = await resolveBLASTVersion();
    core.info(`Installing NCBI BLAST+ version ${blastVersion}`);
    const installPath = await installer.installBlast(blastVersion);
    core.setOutput("install-path", installPath);   
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

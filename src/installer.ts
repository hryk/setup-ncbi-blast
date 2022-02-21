import * as os from "os";
import * as core from "@actions/core";
import * as github from "@actions/github";
import * as tc from "@actions/tool-cache";

function getArchitecture() {}

function validateArch(arch: string) {
  if (arch !== "x64") {
    throw new Error(`Architecture ${arch} is not supported.`);
  }
}

function getPlatform() {
  let platform: string = os.platform();
  switch (platform) {
    case "darwin":
      platform = "macosx";
      break;
    case "win32":
      platform = "win64";
      break;
  }
  return platform;
}

function validatePlatform(platform: string) {
  if (platform !== "linux" && platform !== "macosx" && platform !== "win64") {
    throw new Error(`Platform ${platform} is not supported.`);
  }
}

// Example: ncbi-blast-2.7.1+-x64-win64.tar.gz
function getBlastURL(versionSpec: string, arch: string, osType: string) {
  const baseURL = "https://ftp.ncbi.nlm.nih.gov/blast/executables/blast+";
  return `${baseURL}/${versionSpec}/ncbi-blast-${versionSpec}+-${arch}-${osType}.tar.gz`;
}

export async function installer(versionSpec: string) {
  const arch = os.arch();
  const platform = getPlatform();
  // validate os and architecutre
  validateArch(arch);
  validatePlatform(platform);
  // get download URL
  const blastUrl = getBlastURL(versionSpec, arch, osType);
  // download
  core.info("Downloading ...");
  const downloadPath = await tc.downloadTool(blastUrl);

  // extraction
  core.info("Extracting ...");
  const extPath = await tc.extractTar(downloadPath, undefined, [
    "xz",
    "--strip",
    "1",
  ]);

  core.info("Adding to the cache ...");
  const toolPath = await tc.cacheDir(extPath, "blast", versionSpec, info.arch);

  core.addPath(toolPath);

  core.info("Done");
}

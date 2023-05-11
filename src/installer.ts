import * as os from "os";
import * as path from "path";
import * as core from "@actions/core";
//import * as github from "@actions/github";
import * as tc from "@actions/tool-cache";
import * as fs from "fs";

function getArchitecture() { }

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

// List directories in a path
function getDirectories(path: string) {
  return fs.readdirSync(path).filter(function (file: string) {
    return fs.statSync(path + '/' + file).isDirectory();
  });
}

export async function installBlast(versionSpec: string) {

  // validate os and architecutre
  const arch = os.arch();
  const platform = getPlatform();
  validateArch(arch);
  validatePlatform(platform);

  core.info("OS info - arch: " + arch + ", platform: " + platform)

  // get download URL
  const blastUrl = getBlastURL(versionSpec, arch, platform);

  // download
  core.info("Downloading " + blastUrl)
  const downloadPath = await tc.downloadTool(blastUrl);

  // extraction
  core.info("Extracting ...");
  const extPath = await tc.extractTar(downloadPath, undefined, [
    "xz",
    "--strip",
    "1",
  ]);

  // Keep for future debugging with NCBI .gz files
  //core.info("Examining extraction paths ...")
  //
  //if (fs.existsSync(extPath)) {
  //  core.info(extPath + " contents");
  //  console.log(getDirectories(extPath))
  //} else {
  //  core.error("Cannot find extPath path");
  //}

  // Add to tool cache and PATH
  core.info("Adding to the cache ...");
  let toolPath = await tc.cacheDir(extPath, "blast", versionSpec, arch); 

  // Given results of getDirectories(extPath)
  let binPath = "bin";

  toolPath = path.join(toolPath, binPath);
  core.addPath(toolPath);

  // Test installation
  core.info("Testing BLAST+ path exists ...")

  if (fs.existsSync(toolPath)) {
    core.info("BLAST+ path found at: " + toolPath);
  } else {
	core.setFailed("Cannot find BLAST+ path")
  }

  core.info("Done");

  return toolPath;
}

import { copyDir, copyFile, resetDir, rootPath } from "./lib/fs.mjs";

async function main() {
  const docsDir = rootPath("docs");

  await resetDir(docsDir);
  await copyDir(rootPath("site"), docsDir);
  await copyDir(rootPath("data"), rootPath("docs", "data"));
  await copyFile(rootPath("report", "REPORT.md"), rootPath("docs", "REPORT.md"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const fs = require("fs");
const path = require("path");

module.exports = {
  onVersionChange: (release, changesets) => {
    release.releases.forEach(({ name, newVersion }) => {
      const packagePath = path.join(process.cwd(), "packages", name);
      const versionFilePath = path.join(packagePath, "src", "version.ts");

      const versionContent = `export const version = "${newVersion}";\n`;

      try {
        fs.writeFileSync(versionFilePath, versionContent);
        console.log(`Updated version.ts for ${name} to ${newVersion}`);
      } catch (error) {
        console.warn(`Could not update version.ts for ${name}:`, error.message);
      }
    });
  },
};

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Get arguments from command line
// Usage: node scripts/update.js <updateType> <commitMessage>
const updateType = process.argv[2];
const commitMessage = process.argv[3];

// Valid update types
const VALID_TYPES = ['patch', 'minor', 'major'];

// --- Validation ---

if (!updateType || !VALID_TYPES.includes(updateType)) {
  console.error(`Error: Invalid or missing updateType. Must be one of: ${VALID_TYPES.join(', ')}`);
  process.exit(1);
}

if (!commitMessage) {
  console.error('Error: Missing commitMessage.');
  process.exit(1);
}

const packageJsonPath = path.resolve('package.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found.');
  process.exit(1);
}

// --- Version Update Logic ---

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!packageJson.version) {
    console.error('Error: package.json does not contain a "version" field.');
    process.exit(1);
  }

  const currentVersion = packageJson.version;
  const versionParts = currentVersion.split('.').map(Number);

  if (versionParts.length !== 3 || versionParts.some(isNaN)) {
    console.error(`Error: Invalid semantic version format in package.json: ${currentVersion}`);
    process.exit(1);
  }

  let [major, minor, patch] = versionParts;

  switch (updateType) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
  }

  const newVersion = `${major}.${minor}.${patch}`;
  packageJson.version = newVersion;

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Version updated: ${currentVersion} -> ${newVersion}`);

  // --- Git Operations ---

  console.log('Staging changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`Committing with message: "${commitMessage}"...`);
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

  console.log('Pushing to origin main...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('Update process completed successfully!');
} catch (error) {
  console.error(`Error during update process: ${error.message}`);
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();  // Gets the current working directory
const samplesDir = path.join(repoRoot, 'samples');
const outputDir = path.join(repoRoot, '.metadata');
const outputFile = path.join(outputDir, 'samples.json');

async function readSampleJson(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseErr) {
                    console.error(`Invalid JSON in ${filePath}`);
                    resolve(null);  // Return null if JSON is invalid
                }
            }
        });
    });
}

async function mergeSamples() {
    try {
        let samples = [];
        const directories = fs.readdirSync(samplesDir, { withFileTypes: true });

        for (const dir of directories) {
            if (dir.isDirectory()) {
                const samplePath = path.join(samplesDir, dir.name, 'assets', 'sample.json');
                if (fs.existsSync(samplePath)) {
                    const sampleData = await readSampleJson(samplePath);
                    if (sampleData) {  // Check if the data is not null (valid JSON)
                        samples = samples.concat(sampleData);
                    }
                }
            }
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        fs.writeFileSync(outputFile, JSON.stringify(samples, null, 2));
        console.log('Samples merged successfully.');
    } catch (error) {
        console.error('Failed to merge samples:', error);
    }
}

mergeSamples();

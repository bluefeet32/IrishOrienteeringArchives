import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../constants.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(SCRIPT_DIR, '..');
const DATA_DIR = path.join(SRC_DIR, 'data');
const GENERATED_DIR = path.join(DATA_DIR, 'generated');

async function readJson(filePath) {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function writeJson(filePath, data) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, `${json}\n`, 'utf8');
}

async function loadYearFiles(years) {
    console.log(years);
    const allYears = {};

    for (const year of years) {
        allYears[year] = await readJson(path.join(DATA_DIR, `${year}.json`));
    }

    return allYears;
}

/**
 * Run through all {year}.json files in /data to compile a list of years
 * @returns {string[]}
 */
async function generateYears() {
    const files = await fs.readdir(DATA_DIR);
    const years = files.filter((file) => /^\d\d\d\d\.json$/.test(file)).map((file) => file.slice(0, 4));
    return years;
}

function buildOverviewIndex(years, allYears) {
    // TODO: Build the overview data from `years` and `allYears`.
    // This is intentionally a placeholder so the first step is just file IO.

    const data = [];
    for (const [year, courses] of Object.entries(allYears)) {
        const yearData = { year: year };
        for (const course of EVENT_COURSES) {
            yearData[course] = '';
        }
        for (const [course, courseData] of Object.entries(courses)) {
            yearData[course] = courseData.area;
        }
        data.push(yearData);
    }
    return data.sort().reverse();
}

async function main() {
    const years = await generateYears();
    await writeJson(path.join(GENERATED_DIR, 'years.json'), years);

    const allYears = await loadYearFiles(years);
    const overview = buildOverviewIndex(years, allYears);

    await writeJson(path.join(GENERATED_DIR, 'overview.json'), overview);
    console.log(`Generated ${path.relative(SRC_DIR, path.join(GENERATED_DIR, 'overview.json'))}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function byteHydeEnc(code) {
    try {
        if (!code) {
            throw new Error('Code parameter is required');
        }
        const payload = {
            code: code
        };
        const headers = {
            'authority': 'node.shield.bytehide.com',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
            'content-type': 'application/json',
            'origin': 'https://www.bytehide.com',
            'priority': 'u=1, i',
            'referer': 'https://www.bytehide.com/',
            'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
        };
        const response = await axios.post('https://node.shield.bytehide.com/obfuscate', payload, { headers });
        return response.data.output;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function main() {
    const giftDir = path.join(__dirname, 'gift');
    const files = [];

    function findJsFiles(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                findJsFiles(fullPath);
            } else if (entry.name.endsWith('.js')) {
                files.push(fullPath);
            }
        }
    }

    findJsFiles(giftDir);
    files.push(path.join(__dirname, 'index.js'));
    files.sort();

    console.log(`Found ${files.length} files to encrypt (single pass)\n`);

    let passed = 0;
    let failed = 0;

    for (const file of files) {
        const rel = path.relative(__dirname, file);
        process.stdout.write(`Encrypting: ${rel}...`);

        const code = fs.readFileSync(file, 'utf8');

        const result = await byteHydeEnc(code);
        if (!result) {
            console.log(' FAILED');
            failed++;
            continue;
        }

        fs.writeFileSync(file, result, 'utf8');
        console.log(' OK');
        passed++;
    }

    console.log(`\nDone! ${passed} passed, ${failed} failed out of ${files.length} files`);
}

main();

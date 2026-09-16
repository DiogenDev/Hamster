const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// 1. Obtain GitHub token from Git credential manager
function getGithubToken() {
    try {
        const input = "protocol=https\nhost=github.com\n";
        const output = execSync('git credential fill', { input, encoding: 'utf8' });
        const match = output.match(/^password=(.+)$/m);
        if (match && match[1]) {
            return match[1].trim();
        }
    } catch (e) {
        console.error('Error fetching git credential:', e.message);
    }
    throw new Error('Unable to retrieve GitHub token from git credentials');
}

const token = getGithubToken();
const owner = 'DiogenDev';
const repo = 'Hamster';
const tag = 'v1.2.0-beta';
const releaseTitle = 'Hamster Diogen v1.2.0-beta (Windows + Android Beta)';
const releaseBody = `## 🐹 Hamster Diogen v1.2.0-beta

Первый публичный бета-релиз с полноценной поддержкой Windows (Desktop Pet & Live Wallpaper) и Android!

### ✨ Что нового:
1. **Мгновенный запуск Windows**:
   - Нативный GUI-лаунчер \`HamsterDiogen.exe\` стартует мгновенно (0.05-0.1 сек), без распаковок во временные папки.
   - Доступен полноценный установщик **HamsterDiogen-Setup.exe** с ярлыками и деинсталлятором.
   - Доступна распакованная портативная версия **HamsterDiogen-Windows-v1.2.0-beta.zip**.

2. **Питомец на рабочем столе (Desktop Pet)**:
   - Плавная 60 FPS Canvas-анимация без лагов.
   - Прозрачный фон без темных квадратов и артефактов.
   - Свободное перемещение хомячка по экрану поверх всех окон.
   - Двойной клик по хомячку возвращает его в полноценный интерактивный домик.

3. **Живые обои рабочего стола (WorkerW Live Wallpaper)**:
   - Режим интерактивных живых обоев, интегрированных напрямую в оболочку Windows Explorer (\`WorkerW\`).
   - Обои отображаются строго **ПОД всеми значками рабочего стола и ПОД всеми открытыми окнами**, не мешая работе за компьютером.

4. **Android**:
   - Обновлен мобильный APK (\`HamsterDiogen.apk\`).
`;

function apiRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const defaultHeaders = {
            'User-Agent': 'HamsterDiogen-Publisher',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json'
        };
        options.headers = Object.assign({}, defaultHeaders, options.headers);

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ status: res.statusCode, headers: res.headers, data: parsed });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${typeof parsed === 'object' ? JSON.stringify(parsed) : parsed}`));
                }
            });
        });

        req.on('error', reject);

        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

function uploadAsset(releaseId, filePath, contentType) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(filePath);
        const stats = fs.statSync(filePath);
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`\n>>> Uploading ${fileName} (${fileSizeMB} MB)...`);

        const uploadPath = `/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${encodeURIComponent(fileName)}`;
        const req = https.request({
            hostname: 'uploads.github.com',
            port: 443,
            path: uploadPath,
            method: 'POST',
            headers: {
                'User-Agent': 'HamsterDiogen-Publisher',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': contentType,
                'Content-Length': stats.size
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try { parsed = JSON.parse(data); } catch { parsed = data; }
                if (res.statusCode === 201 || res.statusCode === 200) {
                    console.log(`Successfully uploaded ${fileName}!`);
                    resolve(parsed);
                } else {
                    reject(new Error(`Failed to upload ${fileName} (HTTP ${res.statusCode}): ${JSON.stringify(parsed)}`));
                }
            });
        });

        req.on('error', reject);

        const stream = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });
        let uploaded = 0;
        let lastReport = Date.now();
        stream.on('data', (chunk) => {
            uploaded += chunk.length;
            if (Date.now() - lastReport > 5000 || uploaded === stats.size) {
                const percent = ((uploaded / stats.size) * 100).toFixed(1);
                process.stdout.write(`Progress: ${percent}% (${(uploaded / (1024*1024)).toFixed(1)} / ${fileSizeMB} MB)\r`);
                lastReport = Date.now();
            }
        });
        stream.pipe(req);
    });
}

async function main() {
    console.log('>>> Checking existing releases on GitHub...');
    let release = null;
    try {
        const res = await apiRequest({
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/releases/tags/${tag}`,
            method: 'GET'
        });
        release = res.data;
        console.log(`Found existing release: ID ${release.id}`);
    } catch (e) {
        console.log(`Release ${tag} not found. Creating new release...`);
        const createRes = await apiRequest({
            hostname: 'api.github.com',
            path: `/repos/${owner}/${repo}/releases`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            tag_name: tag,
            name: releaseTitle,
            body: releaseBody,
            draft: false,
            prerelease: true,
            target_commitish: 'main'
        });
        release = createRes.data;
        console.log(`Created release: ID ${release.id}`);
    }

    // Refresh existing assets
    const releaseDetails = await apiRequest({
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/releases/${release.id}`,
        method: 'GET'
    });

    const existingAssets = releaseDetails.data.assets || [];
    console.log(`Existing assets in release: ${existingAssets.length}`);
    for (const a of existingAssets) {
        console.log(`  - ${a.name} (${(a.size / (1024*1024)).toFixed(2)} MB, ID: ${a.id})`);
    }

    const filesToUpload = [
        { file: 'HamsterDiogen.apk', contentType: 'application/vnd.android.package-archive' },
        { file: 'HamsterDiogen-Setup.exe', contentType: 'application/octet-stream' },
        { file: 'HamsterDiogen-Windows-v1.2.0-beta.zip', contentType: 'application/zip' }
    ];

    for (const item of filesToUpload) {
        const fullPath = path.resolve(item.file);
        if (!fs.existsSync(fullPath)) {
            console.error(`File not found: ${fullPath}`);
            continue;
        }

        const fileName = path.basename(fullPath);
        const existing = existingAssets.find(a => a.name === fileName);
        if (existing) {
            console.log(`Deleting previous upload of ${fileName} (asset ID: ${existing.id})...`);
            await apiRequest({
                hostname: 'api.github.com',
                path: `/repos/${owner}/${repo}/releases/assets/${existing.id}`,
                method: 'DELETE'
            });
            console.log(`Deleted old asset ${fileName}`);
        }

        await uploadAsset(release.id, fullPath, item.contentType);
    }

    console.log('\n==========================================');
    console.log('🎉 Release v1.2.0-beta successfully published!');
    console.log(`Release URL: https://github.com/${owner}/${repo}/releases/tag/${tag}`);
    console.log('==========================================\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

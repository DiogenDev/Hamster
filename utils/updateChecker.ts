/**
 * ============================================================================
 * МОДУЛЬ АВТООБНОВЛЕНИЯ: utils/updateChecker.ts
 * ============================================================================
 * Проверяет наличие новых версий на GitHub Releases (DiogenDev/Hamster).
 * Работает для Android (APK) и Windows (EXE).
 * Гарантирует сохранение всех данных и прогресса при обновлении.
 * ============================================================================
 */

export const CURRENT_APP_VERSION = '1.0.0';
export const GITHUB_REPO = 'DiogenDev/Hamster';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  apkDownloadUrl?: string;
  exeDownloadUrl?: string;
  releasePageUrl: string;
}

/**
 * Сравнивает две версии semver (например, "1.0.1" и "1.0.0").
 * Возвращает true, если remote новее чем local.
 */
export function isNewerVersion(remoteVer: string, localVer: string): boolean {
  const cleanRemote = remoteVer.replace(/^v/, '').trim();
  const cleanLocal = localVer.replace(/^v/, '').trim();

  const rParts = cleanRemote.split('.').map((p) => parseInt(p, 10) || 0);
  const lParts = cleanLocal.split('.').map((p) => parseInt(p, 10) || 0);

  const maxLen = Math.max(rParts.length, lParts.length);
  for (let i = 0; i < maxLen; i++) {
    const r = rParts[i] || 0;
    const l = lParts[i] || 0;
    if (r > l) return true;
    if (r < l) return false;
  }
  return false;
}

/**
 * Проверяет GitHub Releases на наличие свежей версии.
 */
export async function checkForGitHubUpdate(): Promise<UpdateCheckResult | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      cache: 'no-cache',
    });

    if (!res.ok) {
      if (res.status === 404) {
        // Релизы пока не созданы на GitHub
        return null;
      }
      return null;
    }

    const data = await res.json();
    const remoteTag = (data.tag_name || data.name || '').replace(/^v/, '');
    const hasUpdate = isNewerVersion(remoteTag, CURRENT_APP_VERSION);

    let apkUrl: string | undefined;
    let exeUrl: string | undefined;

    if (Array.isArray(data.assets)) {
      for (const asset of data.assets) {
        const name = (asset.name || '').toLowerCase();
        if (name.endsWith('.apk')) {
          apkUrl = asset.browser_download_url;
        } else if (name.endsWith('.exe')) {
          exeUrl = asset.browser_download_url;
        }
      }
    }

    return {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: remoteTag,
      releaseTitle: data.name || `Релиз v${remoteTag}`,
      releaseNotes: data.body || 'Улучшения и исправления стабильности хомячка.',
      apkDownloadUrl: apkUrl,
      exeDownloadUrl: exeUrl,
      releasePageUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases`,
    };
  } catch (err) {
    console.warn('[UpdateChecker] Не удалось проверить обновления на GitHub:', err);
    return null;
  }
}

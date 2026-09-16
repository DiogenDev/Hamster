/**
 * ============================================================================
 * СЕРВИС УВЕДОМЛЕНИЙ: utils/notificationService.ts
 * ============================================================================
 * Локальные уведомления для Android (через @capacitor/local-notifications)
 * и браузера (Web Notification API).
 *
 * ПРАВИЛО: Строго не более 1 уведомления в течение 24 часов!
 * ============================================================================
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { TamagotchiSaveData } from '@/types/hamster';

const LAST_NOTIF_STORAGE_KEY = 'hamster_last_notif_timestamp';
const NOTIF_ENABLED_STORAGE_KEY = 'hamster_notif_enabled';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 часа

export interface HamsterNeedAlert {
  id: number;
  title: string;
  body: string;
}

/**
 * Проверяет, включены ли уведомления пользователем в настройках.
 */
export function areNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(NOTIF_ENABLED_STORAGE_KEY);
  // По умолчанию включены (true)
  return saved === null ? true : saved === 'true';
}

/**
 * Переключает статус уведомлений в настройках.
 */
export function setNotificationsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIF_ENABLED_STORAGE_KEY, String(enabled));
}

/**
 * Получает время последнего отправленного уведомления.
 */
export function getLastNotificationTime(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(LAST_NOTIF_STORAGE_KEY) || 0);
}

/**
 * Проверяет, прошло ли 24 часа с момента последнего уведомления.
 * Гарантия: "НЕ БОЛЕЕ 1 РАЗА В ДЕНЬ".
 */
export function canSendDailyNotification(): boolean {
  if (!areNotificationsEnabled()) return false;
  const lastTime = getLastNotificationTime();
  const now = Date.now();
  return (now - lastTime) >= ONE_DAY_MS;
}

/**
 * Фиксирует время отправки уведомления для отсчёта 24-часового лимита.
 */
function recordNotificationSent(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_NOTIF_STORAGE_KEY, String(Date.now()));
}

/**
 * Анализирует состояние хомячка и определяет, что ему срочно нужно.
 * Возвращает текст уведомления или null, если питомец полностью доволен.
 */
export function evaluateHamsterNeeds(data: TamagotchiSaveData): HamsterNeedAlert | null {
  const name = data.petName || 'Хомячок';
  const needs = data.needs;

  if (!needs) return null;

  const foodLevel = data.furniture?.bowlFoodLevel ?? 100;
  const waterLevel = data.furniture?.bottleWaterLevel ?? 100;

  // 1. Голод (наивысший приоритет)
  if (needs.hunger <= 30 || foodLevel <= 15) {
    return {
      id: 101,
      title: `🌾 ${name} проголодался!`,
      body: `Животик урчит! Загляни в клетку и насыпь любимого корма в мисочку.`,
    };
  }

  // 2. Жажда (вода в поилке кончилась)
  if (waterLevel <= 15) {
    return {
      id: 102,
      title: `🧃 ${name} хочет пить!`,
      body: `Поилка почти пуста! Наполни её свежей чистой водичкой.`,
    };
  }

  // 3. Грязь в клетке (гигиена упала или накопились какашки)
  if (needs.hygiene <= 30 || (data.poops && data.poops.length >= 3)) {
    return {
      id: 103,
      title: `🧼 В клетке у ${name} пора прибраться!`,
      body: `Опилки запачкались. Зайди навести чистоту и уют в домике!`,
    };
  }

  // 4. Усталость
  if (needs.energy <= 20) {
    return {
      id: 104,
      title: `💤 ${name} валится с лапок!`,
      body: `Хомячок потратил все силы на бег в колесе и хочет вздремнуть в домике.`,
    };
  }

  // 5. Грусть / одиночество
  if (needs.happiness <= 30) {
    return {
      id: 105,
      title: `💖 ${name} соскучился по тебе!`,
      body: `Хомячку одиноко. Загляни погладить его и почесать пузико!`,
    };
  }

  return null;
}

/**
 * Запрашивает разрешение на отправку уведомлений у пользователя/системы.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if (Capacitor.isNativePlatform()) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
  } catch (err) {
    console.warn('[NotificationService] Ошибка запроса разрешений:', err);
  }

  return false;
}

/**
 * Отправляет уведомление прямо сейчас (с обязательной проверкой 24-часового лимита).
 */
export async function notifyHamsterNeed(data: TamagotchiSaveData, force = false): Promise<boolean> {
  if (!force && !canSendDailyNotification()) {
    return false;
  }

  const alert = evaluateHamsterNeeds(data);
  if (!alert) return false;

  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        const req = await LocalNotifications.requestPermissions();
        if (req.display !== 'granted') return false;
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id: alert.id,
            title: alert.title,
            body: alert.body,
            schedule: { at: new Date(Date.now() + 1000) }, // через 1 секунду
            sound: 'beep.wav',
            smallIcon: 'ic_stat_hamster',
            extra: { type: 'daily_need' },
          },
        ],
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.body,
        icon: '/favicon.ico',
      });
    } else {
      return false;
    }

    recordNotificationSent();
    return true;
  } catch (err) {
    console.warn('[NotificationService] Ошибка отправки уведомления:', err);
    return false;
  }
}

/**
 * Планирует ровно 1 фоновое уведомление на будущее (например, через 24 часа),
 * когда пользователь закрывает или сворачивает приложение.
 */
export async function scheduleFutureNeedNotification(data: TamagotchiSaveData): Promise<void> {
  if (!areNotificationsEnabled()) return;

  try {
    if (Capacitor.isNativePlatform()) {
      // Сначала отменяем любые ранее запланированные напоминания, чтобы не дублировать
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }

      const name = data.petName || 'Хомячок';
      // Планируем на 24 часа вперед
      const fireDate = new Date(Date.now() + ONE_DAY_MS);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: `🐹 ${name} ждёт тебя!`,
            body: `Прошёл целый день! Проверь, как поживает твой питомец, насыпь корма и налей водички.`,
            schedule: { at: fireDate },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_hamster',
          },
        ],
      });
    }
  } catch (err) {
    console.warn('[NotificationService] Ошибка планирования фонового уведомления:', err);
  }
}

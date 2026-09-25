// ============================================================
// audit.js — Ghi log MỌI hành động thay đổi dữ liệu
// Nguyên tắc: append-only, không ai xóa được
// ============================================================

const KEY = 'audit_logs';
const MAX_LOGS = 5000; // giới hạn để không tràn LocalStorage

/**
 * Lấy metadata thiết bị (dùng để truy vết)
 */
function getDeviceInfo() {
  return {
    user_agent: navigator.userAgent,
    platform:   navigator.platform || 'unknown',
    language:   navigator.language,
    screen:     `${screen.width}x${screen.height}`,
    timezone:   Intl.DateTimeFormat().resolvedOptions().timeZone,
    fingerprint: btoa(
      navigator.userAgent + screen.width + screen.height
    ).slice(0, 16),
  };
}

/**
 * Ghi 1 dòng log
 * @param {Object} actor  - user { id, username, global_role }
 * @param {string} action - 'create' | 'update' | 'delete' | 'login' | ...
 * @param {string} target - 'tournament' | 'article' | 'user' | 'verification'
 * @param {string} targetId
 * @param {Object} meta
 */
export function writeLog(actor, action, target, targetId, meta = {}) {
  try {
    const logs = JSON.parse(localStorage.getItem(KEY) || '[]');

    const entry = {
      id:         'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      timestamp:  new Date().toISOString(),
      actor_id:   actor?.id       || 'ANONYMOUS',
      actor_name: actor?.username || 'ANONYMOUS',
      actor_role: actor?.global_role || 'guest',
      action, target,
      target_id:  targetId || null,
      meta,
      device:     getDeviceInfo(),
    };

    logs.push(entry);

    // Giữ tối đa MAX_LOGS dòng mới nhất
    if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);

    localStorage.setItem(KEY, JSON.stringify(logs));
    return entry;
  } catch (err) {
    console.error('[audit] Không ghi được log:', err);
    return null;
  }
}

/**
 * Đọc log (dùng cho trang admin)
 */
export function getLogs({ actorId, target, action, limit = 200 } = {}) {
  let logs = JSON.parse(localStorage.getItem(KEY) || '[]');
  if (actorId) logs = logs.filter(l => l.actor_id === actorId);
  if (target)  logs = logs.filter(l => l.target === target);
  if (action)  logs = logs.filter(l => l.action === action);
  return logs
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

/**
 * Đếm hành động của user trong N giờ (chống spam)
 */
export function countActionsByUser(actorId, hours = 24) {
  const since = Date.now() - hours * 3600 * 1000;
  return getLogs({ actorId }).filter(
    l => new Date(l.timestamp).getTime() > since
  ).length;
}

/**
 * Xóa toàn bộ log (CHỈ dùng khi dev, không expose cho user)
 */
export function clearLogs() {
  localStorage.removeItem(KEY);
}

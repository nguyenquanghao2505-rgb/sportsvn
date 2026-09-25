// ============================================================
// articles.js — CRUD bài viết / video
// Phụ thuộc: audit.js, auth.js
// Độc lập với tournaments.js và tournament-members.js
// ============================================================

import { writeLog } from './audit.js';
import { getCurrentUser } from './auth.js';

const KEY = 'articles_v2';

function loadRaw() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

// ---------- Dữ liệu mẫu ----------
export function seedArticles() {
  if (localStorage.getItem(KEY)) return;
  save([
    {
      id: 'a1',
      title: 'Top 10 cầu thủ xuất sắc nhất năm 2026',
      type: 'article',
      content: 'Danh sách những cầu thủ có phong độ ấn tượng...',
      creator_id: 'u3',
      creator_name: 'bientap',
      createdAt: Date.now(),
      deleted_at: null,
    },
    {
      id: 'a2',
      title: 'Highlight: Chung kết giải bóng đá mùa hè',
      type: 'video',
      content: 'Video tổng hợp những pha bóng đẹp nhất...',
      creator_id: 'u3',
      creator_name: 'bientap',
      createdAt: Date.now(),
      deleted_at: null,
    },
  ]);
}

// ---------- Đọc dữ liệu ----------
export function listArticles() {
  return loadRaw().filter(a => !a.deleted_at);
}

export function listArticlesByType(type) {
  return loadRaw().filter(a => !a.deleted_at && a.type === type);
}

export function getArticleById(id) {
  return loadRaw().find(a => a.id === id && !a.deleted_at) || null;
}

// Dùng cho admin — xem cả bài đã xóa mềm
export function listAllArticlesIncludingDeleted() {
  return loadRaw();
}

// ---------- Tạo bài viết ----------
export function createArticle({ title, content, type }) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');
  if (!title || !title.trim()) throw new Error('Tiêu đề không được trống');

  const validTypes = ['article', 'video'];
  const safeType = validTypes.includes(type) ? type : 'article';

  const list = loadRaw();
  const a = {
    id: 'a' + Date.now(),
    title: title.trim(),
    content: (content || '').trim(),
    type: safeType,
    creator_id: user.id,
    creator_name: user.username,
    createdAt: Date.now(),
    deleted_at: null,
  };
  list.push(a);
  save(list);

  writeLog(user, 'create', 'article', a.id, { title: a.title, type: a.type });
  return a;
}

// ---------- Cập nhật ----------
export function updateArticle(id, patch) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');

  const list = loadRaw();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Không tìm thấy bài viết');

  const oldData = { ...list[idx] };

  // Nếu đổi type, validate
  if (patch.type && !['article', 'video'].includes(patch.type))
    throw new Error('Loại bài viết không hợp lệ');

  list[idx] = {
    ...list[idx],
    ...patch,
    title: patch.title ? patch.title.trim() : list[idx].title,
    updatedAt: Date.now(),
    updated_by: user.id,
  };
  save(list);

  writeLog(user, 'update', 'article', id, { old: oldData, new: patch });
  return list[idx];
}

// ---------- Xóa mềm ----------
export function deleteArticle(id) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');

  const list = loadRaw();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) return;

  list[idx].deleted_at = Date.now();
  list[idx].deleted_by = user.id;
  list[idx].deleted_by_name = user.username;
  save(list);

  writeLog(user, 'delete', 'article', id, { title: list[idx].title });
}

// ---------- Khôi phục (admin) ----------
export function restoreArticle(id) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');
  if (user.global_role !== 'admin')
    throw new Error('Chỉ admin mới khôi phục được');

  const list = loadRaw();
  const idx = list.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Không tìm thấy bài viết');

  list[idx].deleted_at = null;
  list[idx].deleted_by = null;
  list[idx].deleted_by_name = null;
  list[idx].restoredAt = Date.now();
  list[idx].restored_by = user.id;
  save(list);

  writeLog(user, 'restore', 'article', id, { title: list[idx].title });
  return list[idx];
}

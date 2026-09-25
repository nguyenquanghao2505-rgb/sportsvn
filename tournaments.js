// ============================================================
// tournaments.js — CRUD giải đấu + tự gán OWNER khi tạo
// Phụ thuộc: audit.js, auth.js, tournament-members.js
// TẠO SAU tournament-members.js
// ============================================================

import { writeLog } from './audit.js';
import { getCurrentUser } from './auth.js';
import { addMember, TOURNAMENT_ROLES } from './tournament-members.js';

const KEY = 'tournaments_v2';

function loadRaw() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

// ---------- Dữ liệu mẫu ----------
export function seedTournaments() {
  if (localStorage.getItem(KEY)) return;
  save([
    {
      id: 't1',
      name: 'Giải bóng đá mùa hè',
      creator_id: 'u2',
      creator_name: 'nhanvien',
      createdAt: Date.now(),
      deleted_at: null,
    },
    {
      id: 't2',
      name: 'Giải cầu lông toàn quốc',
      creator_id: 'u1',
      creator_name: 'admin',
      createdAt: Date.now(),
      deleted_at: null,
    },
    {
      id: 't3',
      name: 'Giải bóng rổ sinh viên',
      creator_id: 'u2',
      creator_name: 'nhanvien',
      createdAt: Date.now(),
      deleted_at: null,
    },
  ]);
}

// ---------- Đọc dữ liệu ----------
export function listTournaments() {
  return loadRaw().filter(t => !t.deleted_at);
}

export function getTournamentById(id) {
  return loadRaw().find(t => t.id === id && !t.deleted_at) || null;
}

// Dùng cho admin — xem cả giải đã xóa mềm
export function listAllTournamentsIncludingDeleted() {
  return loadRaw();
}

// ---------- Tạo giải ----------
export function createTournament({ name }) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');
  if (!name || !name.trim()) throw new Error('Tên giải không được trống');

  const list = loadRaw();
  const t = {
    id: 't' + Date.now(),
    name: name.trim(),
    creator_id: user.id,
    creator_name: user.username,
    createdAt: Date.now(),
    deleted_at: null,
  };
  list.push(t);
  save(list);

  // 🔑 Tự động gán người tạo làm OWNER của giải
  addMember({
    tournamentId: t.id,
    userId: user.id,
    role: TOURNAMENT_ROLES.OWNER,
    actor: user,
    skipCheck: true,  // bỏ qua kiểm tra quyền khi tạo giải
  });

  // Ghi audit log
  writeLog(user, 'create', 'tournament', t.id, { name: t.name });

  return t;
}

// ---------- Cập nhật giải ----------
export function updateTournament(id, patch) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');

  const list = loadRaw();
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Không tìm thấy giải');

  const oldData = { ...list[idx] };
  list[idx] = {
    ...list[idx],
    ...patch,
    updatedAt: Date.now(),
    updated_by: user.id,
  };
  save(list);

  writeLog(user, 'update', 'tournament', id, { old: oldData, new: patch });
  return list[idx];
}

// ---------- Xóa mềm (soft delete) ----------
export function deleteTournament(id) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');

  const list = loadRaw();
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return;

  // Đánh dấu xóa, KHÔNG xóa khỏi mảng
  list[idx].deleted_at = Date.now();
  list[idx].deleted_by = user.id;
  list[idx].deleted_by_name = user.username;
  save(list);

  writeLog(user, 'delete', 'tournament', id, { name: list[idx].name });
}

// ---------- Khôi phục giải đã xóa (dùng cho admin) ----------
export function restoreTournament(id) {
  const user = getCurrentUser();
  if (!user) throw new Error('Bắt buộc đăng nhập');
  if (user.global_role !== 'admin')
    throw new Error('Chỉ admin mới khôi phục được');

  const list = loadRaw();
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) throw new Error('Không tìm thấy giải');

  list[idx].deleted_at = null;
  list[idx].deleted_by = null;
  list[idx].deleted_by_name = null;
  list[idx].restoredAt = Date.now();
  list[idx].restored_by = user.id;
  save(list);

  writeLog(user, 'restore', 'tournament', id, { name: list[idx].name });
  return list[idx];
}

// ============================================================
// tournament-members.js — Quản lý đội ngũ trong từng giải
// 1 user có thể có nhiều vai trò ở nhiều giải khác nhau
// TẠO FILE NÀY TRƯỚC tournaments.js
// ============================================================

import { writeLog } from './audit.js';

const KEY = 'tournament_members_v2';

export const TOURNAMENT_ROLES = {
  OWNER:        'owner',
  CO_ORGANIZER: 'co-organizer',
  REFEREE:      'referee',
  SCOREKEEPER:  'scorekeeper',
  VIEWER:       'viewer',
};

export const TOURNAMENT_PERMS = {
  [TOURNAMENT_ROLES.OWNER]: [
    'edit_tournament', 'delete_tournament',
    'invite_member', 'remove_member', 'change_member_role',
    'create_match', 'edit_match', 'delete_match',
    'enter_score', 'publish_result',
  ],
  [TOURNAMENT_ROLES.CO_ORGANIZER]: [
    'edit_tournament',
    'invite_member',
    'create_match', 'edit_match', 'delete_match',
    'enter_score', 'publish_result',
  ],
  [TOURNAMENT_ROLES.REFEREE]: [
    'create_match', 'enter_score',
  ],
  [TOURNAMENT_ROLES.SCOREKEEPER]: [
    'enter_score',
  ],
  [TOURNAMENT_ROLES.VIEWER]: [
    'view_match',
  ],
};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

export function seedMembers() {
  if (localStorage.getItem(KEY)) return;
  save([
    { id: 'm1', tournament_id: 't1', user_id: 'u2', role: 'owner',
      invited_by: 'u2', joined_at: Date.now() },
    { id: 'm2', tournament_id: 't1', user_id: 'u3', role: 'scorekeeper',
      invited_by: 'u2', joined_at: Date.now() },
    { id: 'm3', tournament_id: 't2', user_id: 'u1', role: 'owner',
      invited_by: 'u1', joined_at: Date.now() },
  ]);
}

export function listMembers(tournamentId) {
  return load().filter(m => m.tournament_id === tournamentId);
}

export function listTournamentsOfUser(userId) {
  return load().filter(m => m.user_id === userId).map(m => m.tournament_id);
}

export function getRoleInTournament(userId, tournamentId) {
  const m = load().find(
    x => x.user_id === userId && x.tournament_id === tournamentId
  );
  return m ? m.role : null;
}

export function canInTournament(userId, tournamentId, permission) {
  const role = getRoleInTournament(userId, tournamentId);
  if (!role) return false;
  return (TOURNAMENT_PERMS[role] || []).includes(permission);
}

export function addMember({ tournamentId, userId, role, actor, skipCheck = false }) {
  if (!skipCheck && !canInTournament(actor.id, tournamentId, 'invite_member'))
    throw new Error('Bạn không có quyền mời thành viên');

  if (role === TOURNAMENT_ROLES.OWNER && !skipCheck)
    throw new Error('Không thể gán thêm OWNER. Chỉ có thể chuyển nhượng.');

  const list = load();
  if (list.find(m => m.tournament_id === tournamentId && m.user_id === userId))
    throw new Error('Người này đã là thành viên của giải');

  const entry = {
    id: 'm' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    tournament_id: tournamentId,
    user_id: userId,
    role,
    invited_by: actor.id,
    joined_at: Date.now(),
  };
  list.push(entry);
  save(list);

  if (!skipCheck) {
    writeLog(actor, 'add_member', 'tournament', tournamentId,
             { user_id: userId, role });
  }
  return entry;
}

export function changeMemberRole({ tournamentId, userId, newRole, actor }) {
  if (!canInTournament(actor.id, tournamentId, 'change_member_role'))
    throw new Error('Bạn không có quyền đổi vai trò');

  const list = load();
  const idx = list.findIndex(
    m => m.tournament_id === tournamentId && m.user_id === userId
  );
  if (idx === -1) throw new Error('Không tìm thấy thành viên');
  if (list[idx].role === TOURNAMENT_ROLES.OWNER)
    throw new Error('Không thể đổi vai trò OWNER');

  const old = list[idx].role;
  list[idx].role = newRole;
  save(list);
  writeLog(actor, 'change_role', 'tournament', tournamentId,
           { user_id: userId, old_role: old, new_role: newRole });
}

export function removeMember({ tournamentId, userId, actor }) {
  if (!canInTournament(actor.id, tournamentId, 'remove_member'))
    throw new Error('Bạn không có quyền xóa thành viên');

  const list = load();
  const target = list.find(
    m => m.tournament_id === tournamentId && m.user_id === userId
  );
  if (!target) throw new Error('Không tìm thấy thành viên');
  if (target.role === TOURNAMENT_ROLES.OWNER)
    throw new Error('Không thể xóa OWNER');

  save(list.filter(
    m => !(m.tournament_id === tournamentId && m.user_id === userId)
  ));
  writeLog(actor, 'remove_member', 'tournament', tournamentId, { user_id: userId });
}

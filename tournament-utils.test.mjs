import assert from 'node:assert/strict';
import { validateTournamentForm, buildTournamentPayload } from './tournament-utils.mjs';

assert.deepEqual(
  validateTournamentForm({ name: '', sport: 'Taekwondo', start_date: '2026-08-30', location: 'Đà Nẵng' }),
  { ok: false, message: 'Vui lòng nhập tên giải đấu.' }
);

assert.deepEqual(
  validateTournamentForm({ name: 'Giải Taekwondo', sport: 'Taekwondo', start_date: '2026-08-31', end_date: '2026-08-30', location: 'Đà Nẵng' }),
  { ok: false, message: 'Ngày kết thúc không được trước ngày bắt đầu.' }
);

assert.deepEqual(
  validateTournamentForm({ name: 'Giải Taekwondo', sport: 'Taekwondo', start_date: '2026-08-30', end_date: '2026-08-31', location: 'Đà Nẵng' }),
  { ok: true, message: '' }
);

const payload = buildTournamentPayload(
  { name: 'Giải Taekwondo', sport: 'Taekwondo', start_date: '2026-08-30', end_date: '', location: 'Đà Nẵng', status: 'upcoming', description: '' },
  'user-123'
);
assert.deepEqual(payload, {
  name: 'Giải Taekwondo',
  sport: 'Taekwondo',
  start_date: '2026-08-30',
  end_date: null,
  location: 'Đà Nẵng',
  status: 'upcoming',
  description: null,
  organizer_id: 'user-123'
});

console.log('tournament-utils tests: PASS');

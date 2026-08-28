export function validateTournamentForm(data = {}) {
  const name = String(data.name || '').trim();
  const sport = String(data.sport || '').trim();
  const startDate = String(data.start_date || '').trim();
  const endDate = String(data.end_date || '').trim();
  const location = String(data.location || '').trim();

  if (!name) return { ok: false, message: 'Vui lòng nhập tên giải đấu.' };
  if (!sport) return { ok: false, message: 'Vui lòng chọn môn thể thao.' };
  if (!startDate) return { ok: false, message: 'Vui lòng chọn ngày bắt đầu.' };
  if (endDate && endDate < startDate) return { ok: false, message: 'Ngày kết thúc không được trước ngày bắt đầu.' };
  if (!location) return { ok: false, message: 'Vui lòng nhập địa điểm tổ chức.' };

  return { ok: true, message: '' };
}

export function buildTournamentPayload(data = {}, organizerId = null) {
  return {
    name: String(data.name || '').trim(),
    sport: String(data.sport || '').trim(),
    start_date: String(data.start_date || '').trim(),
    end_date: String(data.end_date || '').trim() || null,
    location: String(data.location || '').trim(),
    status: String(data.status || 'draft').trim() || 'draft',
    description: String(data.description || '').trim() || null,
    organizer_id: organizerId || null
  };
}

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

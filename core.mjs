export function slugify(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function seededRandom(seed) {
  let x = (Number(seed) || 1) >>> 0;
  return () => {
    x = (1664525 * x + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

export function drawFirstRound(entries, bracketSize = 8, seed = Date.now()) {
  const size = Math.max(2, 2 ** Math.ceil(Math.log2(bracketSize)));
  const rng = seededRandom(seed);
  const list = entries.map((x, index) => ({ ...x, _index: index }));
  for (let attempt = 0; attempt < 500; attempt++) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    let valid = true;
    for (let i = 0; i < list.length; i += 2) {
      if (list[i].unit && list[i + 1]?.unit && list[i].unit === list[i + 1].unit) valid = false;
    }
    if (valid) break;
  }
  while (list.length < size) list.push({ name: 'BYE', unit: '—', _index: -1 });
  return list.map(({ _index, ...x }) => x);
}

export function hasVenueConflict(existing, candidate) {
  const start = new Date(candidate.start).getTime();
  const end = new Date(candidate.end).getTime();
  if (!(start < end)) return true;
  return existing.some(item => {
    if (String(item.venue_id) !== String(candidate.venue_id)) return false;
    const a = new Date(item.start).getTime();
    const b = new Date(item.end).getTime();
    return a < end && start < b;
  });
}

export function canAccessTournament(tournament, userId) {
  return tournament?.role === 'super_admin' || tournament?.owner_id === userId;
}

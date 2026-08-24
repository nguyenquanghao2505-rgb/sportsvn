# SportsVN Website Design Specification

**Goal:** Build a modern Vietnamese sports information portal for `sportsvn.com`, initially as a static GitHub Pages site that can later grow into tournament registration, athlete profiles, schedules, results, and draw management.

## Scope — Phase 1

- Responsive public homepage.
- Sports news/article presentation.
- Tournament/event cards.
- Sports category navigation.
- Athlete profile cards.
- Match schedule/results presentation.
- Registration call-to-action.
- Search/navigation UI prepared for later backend integration.
- GitHub Pages compatible; no server/database required in Phase 1.
- Custom domain: `sportsvn.com`.

## Visual direction

- Primary identity: blue sports/news aesthetic with white backgrounds.
- Strong editorial hierarchy, large hero story, compact news cards.
- Desktop-first but fully responsive on phones.
- Vietnamese copy and typography.
- Clean, professional appearance suitable for a national sports portal.

## Initial information architecture

1. Trang chủ
2. Tin thể thao
3. Giải đấu
4. Vận động viên
5. Lịch thi đấu
6. Kết quả
7. Bốc thăm
8. Đăng ký giải

## Technical direction

- Plain HTML, CSS and JavaScript for maximum simplicity and GitHub Pages compatibility.
- No framework or build step in Phase 1.
- `index.html` as the entry point.
- `assets/` for local images/icons.
- `styles.css` for visual system.
- `app.js` for small interactive behaviors such as mobile menu, filtering and search.
- `CNAME` containing `sportsvn.com` for GitHub Pages custom-domain configuration.

## Future extension points

The static UI should leave clear areas for later APIs/database integration:
- tournaments
- teams
- athletes
- registrations
- schedules
- results
- draws
- news/articles

import { normalizeEmail, validatePassword, canManage } from './auth-utils.mjs';
import { buildSingleEliminationPairings } from './draw-utils.mjs';

const cfg = window.SPORTSVN_CONFIG || {};

const root = document.querySelector('#admin-app');

const configured =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes('YOUR_') &&
    !cfg.SUPABASE_ANON_KEY.includes('YOUR_');

const sb = configured
    ? window.supabase.createClient(
        cfg.SUPABASE_URL,
        cfg.SUPABASE_ANON_KEY
      )
    : null;

let session = null;
let profile = null;

const CONTACT = {
    email: 'Nguyenquanghao2505@gmail.com',
    phone: '0905771177',
    zalo: ['0905771177', '0384913999']
};

const BANK = {
    owner: 'Nguyễn Quang Hảo',
    bank: 'SHB – Chi nhánh Đà Nẵng',
    account: '0107797979'
};

const NAV = [
    ['dashboard', 'Tổng quan'],
    ['tournaments', 'Giải đấu'],
    ['athletes', 'Vận động viên'],
    ['organizations', 'Đơn vị / CLB'],
    ['venues', 'Đặt sân / địa điểm'],
    ['draw', 'Bốc thăm'],
    ['matches', 'Lịch thi đấu'],
    ['results', 'Kết quả'],
    ['news', 'Tin tức'],
    ['ai', 'AI SportsVN'],
    ['billing', 'Thanh toán']
];

const TABLE_MAP = {
    athletes: 'athletes',
    organizations: 'organizations',
    venues: 'venues',
    matches: 'matches',
    results: 'results',
    news: 'news'
};


/* =========================================================
   TIỆN ÍCH
========================================================= */

function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[char]));
}

function formatValue(value) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    return String(value);
}

function toast(message, ok = false) {
    const el = document.querySelector('#toast');

    if (!el) return;

    el.textContent = message;
    el.className = 'toast show ' + (ok ? 'ok' : '');

    setTimeout(() => {
        el.className = 'toast';
    }, 3000);
}

function getCurrentKey() {
    return location.hash.replace('#', '') || 'dashboard';
}

function hasManagePermission() {
    try {
        return canManage(profile);
    } catch {
        return profile?.role === 'admin' || profile?.role === 'manager';
    }
}


/* =========================================================
   ĐĂNG NHẬP
========================================================= */

function login() {

    root.innerHTML = `
        <div class="login-wrap">
            <form id="login" class="login-card">

                <div class="login-logo">SV</div>

                <h1>SportsVN</h1>

                <p>Trung tâm quản lý giải đấu thể thao Việt Nam</p>

                <label>
                    Email
                    <input
                        id="email"
                        type="email"
                        autocomplete="username"
                        required
                    >
                </label>

                <label>
                    Mật khẩu
                    <input
                        id="password"
                        type="password"
                        autocomplete="current-password"
                        required
                    >
                </label>

                <button class="btn primary" type="submit">
                    ĐĂNG NHẬP
                </button>

                <div id="err" class="form-error"></div>

                <small>
                    Hỗ trợ:
                    ${escapeHtml(CONTACT.email)}
                    ·
                    ${escapeHtml(CONTACT.phone)}
                </small>

            </form>
        </div>
    `;

    const form = document.querySelector('#login');

    form.onsubmit = async event => {

        event.preventDefault();

        const err = document.querySelector('#err');

        const email = normalizeEmail(
            document.querySelector('#email').value
        );

        const password =
            document.querySelector('#password').value;

        const check = validatePassword(password);

        if (!check.ok) {
            err.textContent = check.message;
            return;
        }

        if (!sb) {
            err.textContent =
                'Chưa cấu hình Supabase trong config.js.';
            return;
        }

        err.textContent = 'Đang đăng nhập...';

        const { error } =
            await sb.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            err.textContent =
                'Email hoặc mật khẩu không chính xác.';
            return;
        }

        err.textContent = '';
    };
}


/* =========================================================
   PROFILE
========================================================= */

async function getProfile() {

    if (!sb || !session) return null;

    const { data, error } =
        await sb
            .from('profiles')
            .select('id,full_name,phone,role')
            .eq('id', session.user.id)
            .single();

    if (error) {
        console.error('Profile error:', error);
        return null;
    }

    return data;
}


/* =========================================================
   KHUNG QUẢN TRỊ
========================================================= */

function shell() {

    const key = getCurrentKey();

    const current =
        NAV.find(item => item[0] === key);

    root.innerHTML = `

        <div id="toast" class="toast"></div>

        <div class="admin-layout">

            <aside class="sidebar">

                <div class="admin-brand">
                    <b>SV</b>
                    <strong>SPORTSVN</strong>
                    <small>Trung tâm điều hành</small>
                </div>

                <nav class="side-nav">

                    ${NAV.map(([id, title]) => `
                        <a
                            href="#${id}"
                            class="${key === id ? 'active' : ''}"
                        >
                            ${escapeHtml(title)}
                        </a>
                    `).join('')}

                </nav>

                <div class="contact-mini">
                    ${escapeHtml(CONTACT.email)}
                    <br>
                    ${escapeHtml(CONTACT.phone)}
                </div>

                <button
                    id="logout"
                    class="logout"
                >
                    Đăng xuất
                </button>

            </aside>


            <section class="admin-main">

                <header class="admin-head">

                    <div>
                        <span>SPORTSVN</span>
                        <h1>
                            ${escapeHtml(
                                current?.[1] || 'Tổng quan'
                            )}
                        </h1>
                    </div>

                    <div class="user-pill">
                        ${escapeHtml(
                            profile?.full_name ||
                            session?.user?.email ||
                            ''
                        )}

                        ·

                        ${escapeHtml(
                            profile?.role ||
                            'manager'
                        )}
                    </div>

                </header>

                <div id="view"></div>

            </section>

        </div>
    `;

    document.querySelector('#logout').onclick = async () => {

        if (sb) {
            await sb.auth.signOut();
        }

    };

    renderView(key);
}


/* =========================================================
   ĐIỀU HƯỚNG MODULE
========================================================= */

async function renderView(key) {

    const view =
        document.querySelector('#view');

    if (!view) return;

    switch (key) {

        case 'dashboard':
            return dashboard(view);

        case 'tournaments':
            return tournaments(view);

        case 'athletes':
            return genericModule(
                view,
                'athletes',
                'Vận động viên',
                'Quản lý danh sách vận động viên.'
            );

        case 'organizations':
            return genericModule(
                view,
                'organizations',
                'Đơn vị / CLB',
                'Quản lý đơn vị, câu lạc bộ và đoàn thể thao.'
            );

        case 'venues':
            return genericModule(
                view,
                'venues',
                'Đặt sân / địa điểm',
                'Quản lý địa điểm tổ chức và sân thi đấu.'
            );

        case 'draw':
            return drawModule(view);

        case 'matches':
            return genericModule(
                view,
                'matches',
                'Lịch thi đấu',
                'Theo dõi và quản lý lịch thi đấu.'
            );

        case 'results':
            return genericModule(
                view,
                'results',
                'Kết quả',
                'Theo dõi kết quả thi đấu.'
            );

        case 'news':
            return genericModule(
                view,
                'news',
                'Tin tức',
                'Quản lý tin tức thể thao SportsVN.'
            );

        case 'ai':
            return aiModule(view);

        case 'billing':
            return billing(view);

        default:
            return dashboard(view);
    }
}


/* =========================================================
   DASHBOARD
========================================================= */

async function dashboard(view) {

    let counts = {
        tournaments: 0,
        athletes: 0,
        organizations: 0,
        venues: 0
    };

    if (sb) {

        const tables = [
            'tournaments',
            'athletes',
            'organizations',
            'venues'
        ];

        const responses =
            await Promise.all(
                tables.map(table =>
                    sb
                        .from(table)
                        .select('id', {
                            count: 'exact',
                            head: true
                        })
                )
            );

        counts = {
            tournaments:
                responses[0].count || 0,

            athletes:
                responses[1].count || 0,

            organizations:
                responses[2].count || 0,

            venues:
                responses[3].count || 0
        };
    }

    view.innerHTML = `

        <div class="admin-cards">

            <article>
                <span>Giải đấu</span>
                <b>${counts.tournaments}</b>
            </article>

            <article>
                <span>Vận động viên</span>
                <b>${counts.athletes}</b>
            </article>

            <article>
                <span>Đơn vị / CLB</span>
                <b>${counts.organizations}</b>
            </article>

            <article>
                <span>Địa điểm</span>
                <b>${counts.venues}</b>
            </article>

        </div>


        <div class="admin-panel">

            <div class="panel-head">

                <div>

                    <h2>
                        Chào mừng đến SportsVN
                    </h2>

                    <p>
                        Hệ thống quản lý giải đấu,
                        vận động viên, bốc thăm,
                        lịch thi đấu và kết quả.
                    </p>

                </div>

                <a
                    class="btn primary"
                    href="#tournaments"
                >
                    ＋ Tạo giải đấu
                </a>

            </div>


            <div class="info-grid">

                <div>
                    <b>Liên hệ SportsVN</b>

                    <p>
                        ${escapeHtml(CONTACT.email)}
                        <br>
                        ${escapeHtml(CONTACT.phone)}
                        <br>
                        Zalo:
                        ${escapeHtml(
                            CONTACT.zalo.join(' · ')
                        )}
                    </p>
                </div>


                <div>

                    <b>Thông tin thanh toán</b>

                    <p>
                        ${escapeHtml(BANK.owner)}
                        <br>
                        ${escapeHtml(BANK.bank)}
                        <br>
                        STK:
                        <strong>
                            ${escapeHtml(BANK.account)}
                        </strong>
                    </p>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   GIẢI ĐẤU
========================================================= */

async function tournaments(view) {

    if (!hasManagePermission()) {

        view.innerHTML = `
            <div class="admin-panel">

                <h2>Không có quyền</h2>

                <p>
                    Tài khoản hiện tại không có quyền
                    quản lý giải đấu.
                </p>

            </div>
        `;

        return;
    }

    const { data, error } =
        await sb
            .from('tournaments')
            .select('*')
            .order('created_at', {
                ascending: false
            });

    if (error) {

        view.innerHTML = `
            <div class="admin-panel">

                <h2>Không đọc được dữ liệu</h2>

                <p class="form-error">
                    ${escapeHtml(error.message)}
                </p>

            </div>
        `;

        return;
    }

    const rows = data || [];

    view.innerHTML = `

        <div class="admin-panel">

            <div class="panel-head">

                <div>
                    <h2>Giải đấu của tôi</h2>

                    <p>
                        Tạo, chỉnh sửa và quản lý
                        giải đấu SportsVN.
                    </p>
                </div>

                <button
                    id="newTournament"
                    class="btn primary"
                >
                    ＋ Tạo giải đấu
                </button>

            </div>


            <div class="table-wrap">

                <table>

                    <thead>

                        <tr>
                            <th>Tên giải</th>
                            <th>Môn</th>
                            <th>Thời gian</th>
                            <th>Địa điểm</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${
                            rows.length
                            ? rows.map(row => `

                                <tr>

                                    <td>
                                        <strong>
                                            ${escapeHtml(
                                                row.name
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            row.sport
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            row.start_date || '—'
                                        )}
                                        →
                                        ${escapeHtml(
                                            row.end_date || '—'
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            row.venue_name || '—'
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            row.status || '—'
                                        )}
                                    </td>

                                    <td>

                                        <button
                                            class="linkbtn edit"
                                            data-id="${row.id}"
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            class="linkbtn del"
                                            data-id="${row.id}"
                                        >
                                            Xóa
                                        </button>

                                    </td>

                                </tr>

                            `).join('')
                            :
                            `
                                <tr>
                                    <td colspan="6">
                                        Chưa có giải đấu.
                                    </td>
                                </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>

            <div id="editor"></div>

        </div>
    `;

    document
        .querySelector('#newTournament')
        .onclick = () => tournamentEditor();

    document
        .querySelectorAll('.edit')
        .forEach(button => {

            button.onclick = () => {

                const row =
                    rows.find(
                        item =>
                            String(item.id) ===
                            String(button.dataset.id)
                    );

                tournamentEditor(row);
            };

        });

    document
        .querySelectorAll('.del')
        .forEach(button => {

            button.onclick = async () => {

                if (
                    !confirm(
                        'Bạn có chắc muốn xóa giải đấu này?'
                    )
                ) {
                    return;
                }

                const { error } =
                    await sb
                        .from('tournaments')
                        .delete()
                        .eq(
                            'id',
                            button.dataset.id
                        );

                if (error) {

                    toast(error.message);

                    return;
                }

                toast(
                    'Đã xóa giải đấu.',
                    true
                );

                tournaments(view);
            };

        });
}


/* =========================================================
   FORM GIẢI ĐẤU
========================================================= */

function tournamentEditor(row = null) {

    const editor =
        document.querySelector('#editor');

    if (!editor) return;

    editor.innerHTML = `

        <form
            id="tourForm"
            class="editor"
        >

            <h3>
                ${row ? 'Chỉnh sửa' : 'Tạo mới'}
                giải đấu
            </h3>


            <div class="form-grid">

                <label>
                    Tên giải
                    <input
                        name="name"
                        required
                        value="${escapeHtml(
                            row?.name || ''
                        )}"
                    >
                </label>


                <label>
                    Môn thể thao
                    <input
                        name="sport"
                        required
                        value="${escapeHtml(
                            row?.sport || ''
                        )}"
                    >
                </label>


                <label>
                    Ngày bắt đầu
                    <input
                        name="start_date"
                        type="date"
                        value="${row?.start_date || ''}"
                    >
                </label>


                <label>
                    Ngày kết thúc
                    <input
                        name="end_date"
                        type="date"
                        value="${row?.end_date || ''}"
                    >
                </label>


                <label>
                    Trạng thái

                    <select name="status">

                        <option
                            value="draft"
                            ${row?.status === 'draft'
                                ? 'selected'
                                : ''}
                        >
                            Nháp
                        </option>

                        <option
                            value="registration"
                            ${row?.status === 'registration'
                                ? 'selected'
                                : ''}
                        >
                            Mở đăng ký
                        </option>

                        <option
                            value="running"
                            ${row?.status === 'running'
                                ? 'selected'
                                : ''}
                        >
                            Đang thi đấu
                        </option>

                        <option
                            value="finished"
                            ${row?.status === 'finished'
                                ? 'selected'
                                : ''}
                        >
                            Đã kết thúc
                        </option>

                    </select>

                </label>


                <label>
                    Địa điểm
                    <input
                        name="venue_name"
                        value="${escapeHtml(
                            row?.venue_name || ''
                        )}"
                    >
                </label>

            </div>


            <label>
                Mô tả

                <textarea
                    name="description"
                >${escapeHtml(
                    row?.description || ''
                )}</textarea>

            </label>


            <div>

                <button
                    class="btn primary"
                    type="submit"
                >
                    Lưu giải đấu
                </button>

                <button
                    type="button"
                    id="cancelEdit"
                    class="btn"
                >
                    Hủy
                </button>

            </div>

        </form>
    `;

    editor
        .querySelector('#cancelEdit')
        .onclick = () => {
            editor.innerHTML = '';
        };

    editor
        .querySelector('#tourForm')
        .onsubmit = async event => {

            event.preventDefault();

            const form =
                new FormData(event.currentTarget);

            const payload =
                Object.fromEntries(
                    form.entries()
                );

            if (
                payload.start_date &&
                payload.end_date &&
                payload.end_date <
                payload.start_date
            ) {

                toast(
                    'Ngày kết thúc phải sau ngày bắt đầu.'
                );

                return;
            }

            payload.owner_id =
                session.user.id;

            let query;

            if (row) {

                query =
                    sb
                        .from('tournaments')
                        .update(payload)
                        .eq('id', row.id);

            } else {

                query =
                    sb
                        .from('tournaments')
                        .insert(payload);
            }

            const { error } =
                await query;

            if (error) {

                toast(error.message);

                return;
            }

            toast(
                row
                    ? 'Đã cập nhật giải đấu.'
                    : 'Đã tạo giải đấu.',
                true
            );

            tournaments(
                document.querySelector('#view')
            );
        };
}


/* =========================================================
   MODULE DỮ LIỆU CHUNG
========================================================= */

async function genericModule(
    view,
    table,
    title,
    description
) {

    view.innerHTML = `

        <div class="admin-panel">

            <div class="panel-head">

                <div>
                    <h2>${escapeHtml(title)}</h2>

                    <p>
                        ${escapeHtml(description)}
                    </p>
                </div>

                <button
                    class="btn"
                    id="refreshData"
                >
                    ↻ Làm mới
                </button>

            </div>

            <div id="genericContent">
                Đang tải dữ liệu...
            </div>

        </div>
    `;

    document
        .querySelector('#refreshData')
        .onclick = () =>
            genericModule(
                view,
                table,
                title,
                description
            );

    const content =
        document.querySelector('#genericContent');

    if (!sb) {

        content.innerHTML =
            '<p class="form-error">Chưa kết nối Supabase.</p>';

        return;
    }

    const { data, error } =
        await sb
            .from(table)
            .select('*')
            .limit(100);

    if (error) {

        content.innerHTML = `

            <div class="empty">

                <p class="form-error">
                    Không đọc được bảng
                    <strong>${escapeHtml(table)}</strong>.
                </p>

                <p>
                    ${escapeHtml(error.message)}
                </p>

            </div>
        `;

        return;
    }

    const rows = data || [];

    if (!rows.length) {

        content.innerHTML = `

            <div class="empty">

                Chưa có dữ liệu trong
                <strong>${escapeHtml(table)}</strong>.

            </div>
        `;

        return;
    }

    const columns =
        Object.keys(rows[0]);

    content.innerHTML = `

        <div class="table-wrap">

            <table>

                <thead>

                    <tr>

                        ${columns
                            .map(column => `
                                <th>
                                    ${escapeHtml(column)}
                                </th>
                            `)
                            .join('')}

                    </tr>

                </thead>

                <tbody>

                    ${rows.map(row => `

                        <tr>

                            ${columns
                                .map(column => `
                                    <td>
                                        ${escapeHtml(
                                            formatValue(
                                                row[column]
                                            )
                                        )}
                                    </td>
                                `)
                                .join('')}

                        </tr>

                    `).join('')}

                </tbody>

            </table>

        </div>

        <div class="muted">
            Hiển thị tối đa 100 bản ghi.
        </div>
    `;
}


/* =========================================================
   BỐC THĂM
========================================================= */

async function drawModule(view) {

    view.innerHTML = `

        <div class="admin-panel">

            <div class="panel-head">

                <div>

                    <h2>Bốc thăm thi đấu</h2>

                    <p>
                        Tạo nhanh nhánh đấu loại trực tiếp
                        từ danh sách đăng ký.
                    </p>

                </div>

            </div>


            <div class="form-grid">

                <label>

                    Chọn giải đấu

                    <select id="drawTournament">
                        <option value="">
                            Đang tải...
                        </option>
                    </select>

                </label>

                <label>

                    Số lượng đội / VĐV

                    <input
                        id="drawCount"
                        type="number"
                        min="2"
                        value="8"
                    >

                </label>

            </div>


            <button
                id="generateDraw"
                class="btn primary"
            >
                🎲 Bốc thăm
            </button>


            <div
                id="drawResult"
                style="margin-top:20px"
            ></div>

        </div>
    `;

    const select =
        document.querySelector('#drawTournament');

    const { data, error } =
        await sb
            .from('tournaments')
            .select('id,name')
            .order('created_at', {
                ascending: false
            });

    if (error) {

        select.innerHTML =
            '<option>Không tải được giải đấu</option>';

        return;
    }

    select.innerHTML = `
        <option value="">
            -- Chọn giải đấu --
        </option>

        ${(data || []).map(item => `
            <option value="${item.id}">
                ${escapeHtml(item.name)}
            </option>
        `).join('')}
    `;

    document
        .querySelector('#generateDraw')
        .onclick = async () => {

            const tournamentId =
                select.value;

            const result =
                document.querySelector('#drawResult');

            if (!tournamentId) {

                toast(
                    'Vui lòng chọn giải đấu.'
                );

                return;
            }

            const count =
                Number(
                    document.querySelector(
                        '#drawCount'
                    ).value
                );

            if (count < 2) {

                toast(
                    'Số lượng phải từ 2 trở lên.'
                );

                return;
            }

            const names =
                Array.from(
                    { length: count },
                    (_, index) =>
                        `Đội / VĐV ${index + 1}`
                );

            let pairings;

            try {

                pairings =
                    buildSingleEliminationPairings(
                        names
                    );

            } catch (error) {

                console.error(error);

                pairings =
                    createSimplePairings(names);
            }

            result.innerHTML = `

                <div class="admin-panel">

                    <h3>
                        Nhánh đấu dự kiến
                    </h3>

                    <div class="table-wrap">

                        <table>

                            <thead>
                                <tr>
                                    <th>Trận</th>
                                    <th>VĐV / Đội 1</th>
                                    <th>VĐV / Đội 2</th>
                                </tr>
                            </thead>

                            <tbody>

                                ${pairings.map(
                                    (match, index) => `

                                    <tr>

                                        <td>
                                            ${index + 1}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                match?.[0] ||
                                                match?.a ||
                                                'BYE'
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                match?.[1] ||
                                                match?.b ||
                                                'BYE'
                                            )}
                                        </td>

                                    </tr>
                                `).join('')}

                            </tbody>

                        </table>

                    </div>

                    <p class="muted">
                        Đây là bản xem trước.
                        Chưa ghi nhánh đấu vào cơ sở dữ liệu.
                    </p>

                </div>
            `;
        };
}


/* =========================================================
   BỐC THĂM DỰ PHÒNG
========================================================= */

function createSimplePairings(items) {

    const list = [...items];

    while (list.length % 2 !== 0) {
        list.push('BYE');
    }

    const result = [];

    for (let i = 0; i < list.length; i += 2) {

        result.push([
            list[i],
            list[i + 1]
        ]);
    }

    return result;
}


/* =========================================================
   AI SPORTSVN
========================================================= */

function aiModule(view) {

    view.innerHTML = `

        <div class="admin-panel">

            <div class="panel-head">

                <div>

                    <h2>AI SportsVN</h2>

                    <p>
                        Trợ lý AI hỗ trợ quản lý
                        và vận hành giải đấu.
                    </p>

                </div>

            </div>


            <div class="info-grid">

                <div>

                    <b>AI quản lý giải đấu</b>

                    <p>
                        Hỗ trợ lập lịch,
                        phân tích giải đấu,
                        kiểm tra dữ liệu
                        và đề xuất phương án.
                    </p>

                </div>


                <div>

                    <b>AI nội dung thể thao</b>

                    <p>
                        Hỗ trợ soạn tin,
                        tiêu đề,
                        bài viết,
                        thông báo
                        và nội dung mạng xã hội.
                    </p>

                </div>


                <div>

                    <b>AI phân tích kết quả</b>

                    <p>
                        Phân tích bảng đấu,
                        kết quả,
                        thành tích và thống kê.
                    </p>

                </div>

            </div>


            <div class="empty">

                Module AI sẽ được kết nối
                sau khi hoàn thiện API AI.

            </div>

        </div>
    `;
}


/* =========================================================
   THANH TOÁN
========================================================= */

function billing(view) {

    view.innerHTML = `

        <div class="admin-panel">

            <h2>
                Thanh toán SportsVN
            </h2>

            <p>
                Thông tin chuyển khoản chính thức:
            </p>


            <div class="bank-card">

                <b>
                    ${escapeHtml(BANK.owner)}
                </b>

                <span>
                    ${escapeHtml(BANK.bank)}
                </span>

                <strong>
                    ${escapeHtml(BANK.account)}
                </strong>

                <small>
                    Nội dung:
                    SPORTSVN + mã đơn hàng
                </small>

            </div>


            <p class="muted">

                Khi triển khai cổng thanh toán
                tự động, khóa bí mật sẽ được
                đặt phía máy chủ và không đưa
                vào GitHub.

            </p>

        </div>
    `;
}


/* =========================================================
   KHỞI ĐỘNG
========================================================= */

async function start() {

    if (!sb) {

        login();

        return;
    }

    const {
        data
    } = await sb.auth.getSession();

    session =
        data?.session || null;

    if (!session) {

        login();

        return;
    }

    profile =
        await getProfile();

    shell();


    sb.auth.onAuthStateChange(
        async (_event, newSession) => {

            session =
                newSession || null;

            if (!session) {

                profile = null;

                login();

                return;
            }

            profile =
                await getProfile();

            shell();
        }
    );
}


/* =========================================================
   HASH NAVIGATION
========================================================= */

window.addEventListener(
    'hashchange',
    () => {

        if (session) {
            shell();
        }

    }
);


/* =========================================================
   START
========================================================= */

start();

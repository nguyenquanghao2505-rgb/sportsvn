export function normalizeEmail(email){return String(email||'').trim().toLowerCase();}
export function validatePassword(password){const p=String(password||''); if(p.length<8)return {ok:false,message:'Mật khẩu phải có ít nhất 8 ký tự.'}; return {ok:true};}
export function roleLabel(role){return ({super_admin:'Quản trị hệ thống',organizer:'Ban tổ chức',editor:'Biên tập viên',referee:'Trọng tài',viewer:'Người xem'})[role]||role||'';}

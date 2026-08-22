export function normalizeEmail(email){ return String(email||'').trim().toLowerCase(); }
export function validatePassword(password){
  const p=String(password||'');
  if(p.length<8) return {ok:false,message:'Mật khẩu phải có ít nhất 8 ký tự.'};
  return {ok:true};
}
export function hasRole(profile, roles=[]){ return roles.includes(profile?.role); }
export function canManage(profile){ return ['admin','manager'].includes(profile?.role); }

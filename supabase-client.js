(function(){
  const cfg=window.SPORTSVN_CONFIG||{};
  if(!cfg.SUPABASE_URL||!cfg.SUPABASE_PUBLISHABLE_KEY) throw new Error('Thiếu cấu hình Supabase trong config.js');
  if(!window.supabase?.createClient) throw new Error('Chưa tải Supabase JS client.');
  window.sportsvnSupabase=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
})();

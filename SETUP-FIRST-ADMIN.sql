-- Sau khi tạo user đầu tiên trong Supabase Authentication > Users,
-- thay EMAIL_CUA_ANH bằng email thật rồi chạy câu lệnh này.
update public.profiles
set role='super_admin'
where id=(select id from auth.users where email='EMAIL_CUA_ANH');

-- Kiểm tra:
select p.id,p.full_name,p.role,u.email
from public.profiles p join auth.users u on u.id=p.id
order by p.created_at desc;

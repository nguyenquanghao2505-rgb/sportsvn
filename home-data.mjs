
export const navItems = [
  { label: 'Trang chủ', href: '#home' },
  { label: 'Tin tức', href: '#news' },
  { label: 'Giải đấu', href: '#tournaments' },
  { label: 'Lịch thi đấu', href: '#schedule' },
  { label: 'Kết quả', href: '#results' },
  { label: 'Vận động viên', href: '#athletes' },
  { label: 'BXH', href: '#standings' }
];

export const sportCategories = [
  'Bóng đá', 'Bóng rổ', 'Bóng chuyền', 'Cầu lông',
  'Pickleball', 'Tennis', 'Bơi', 'Taekwondo',
  'Vovinam', 'Cờ tướng'
];

export const newsData = [
  {category:'Bóng đá', time:'10 phút trước', title:'Cập nhật những thông tin thể thao mới nhất', image:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80'},
  {category:'Bóng chuyền', time:'25 phút trước', title:'Những diễn biến đáng chú ý tại các giải đấu', image:'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=80'},
  {category:'Cầu lông', time:'40 phút trước', title:'Các VĐV chuẩn bị cho ngày thi đấu mới', image:'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80'},
  {category:'Bóng rổ', time:'1 giờ trước', title:'Lịch thi đấu và những trận đấu đáng chờ đợi', image:'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'},
  {category:'Pickleball', time:'2 giờ trước', title:'Phong trào pickleball tiếp tục phát triển mạnh', image:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'},
  {category:'Bơi', time:'3 giờ trước', title:'Các kình ngư sẵn sàng cho ngày tranh tài', image:'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80'}
];

export const tournamentData = [
  {name:'Đại hội Thể dục thể thao thành phố Đà Nẵng lần thứ X, năm 2026', sport:'Nhiều môn', status:'Đang diễn ra', date:'2026'},
  {name:'Giải Pickleball SportsVN', sport:'Pickleball', status:'Sắp diễn ra', date:'2026'},
  {name:'Giải Cầu lông mở rộng', sport:'Cầu lông', status:'Đang đăng ký', date:'2026'}
];

export function filterNews(items, category='Tất cả') {
  return category === 'Tất cả' ? items : items.filter(item => item.category === category);
}

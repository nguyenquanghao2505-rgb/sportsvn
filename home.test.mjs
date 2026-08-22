
import assert from 'node:assert/strict';
import { navItems, sportCategories, filterNews } from './home-data.mjs';

assert.equal(navItems[0].label, 'Trang chủ');
assert.ok(sportCategories.includes('Bóng đá'));
assert.equal(filterNews([{category:'Bóng đá', title:'A'}], 'Bóng đá').length, 1);
console.log('PASS');

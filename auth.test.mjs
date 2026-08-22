import test from 'node:test'; import assert from 'node:assert/strict';
import {normalizeEmail,validatePassword,hasRole,canManage} from '../admin/auth-utils.mjs';
test('normalize email',()=>assert.equal(normalizeEmail(' Hao@Example.COM '),'hao@example.com'));
test('password minimum',()=>{assert.equal(validatePassword('1234567').ok,false);assert.equal(validatePassword('12345678').ok,true)});
test('roles',()=>{assert.equal(hasRole({role:'admin'},['admin']),true);assert.equal(canManage({role:'manager'}),true);assert.equal(canManage({role:'viewer'}),false)});

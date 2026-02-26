import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRequestUrl, validateForm } from './runtimeFormLogic.js';
test('resolveRequestUrl: empty url -> empty', () => {
    assert.equal(resolveRequestUrl('', 'http://api'), '');
    assert.equal(resolveRequestUrl('   ', 'http://api'), '');
});
test('resolveRequestUrl: absolute url as-is', () => {
    assert.equal(resolveRequestUrl('https://example.com/a', 'http://api'), 'https://example.com/a');
    assert.equal(resolveRequestUrl('http://example.com/a', ''), 'http://example.com/a');
});
test('resolveRequestUrl: joins apiBase and relative path', () => {
    assert.equal(resolveRequestUrl('/api/x', 'http://localhost:4000'), 'http://localhost:4000/api/x');
    assert.equal(resolveRequestUrl('api/x', 'http://localhost:4000/'), 'http://localhost:4000/api/x');
});
test('validateForm: passes when required fields provided and unique', () => {
    const r = validateForm([
        { name: 'a', required: true },
        { name: 'b' },
    ], { a: '1', b: '' });
    assert.equal(r.ok, true);
    assert.equal(r.firstError, undefined);
    assert.equal(Object.keys(r.errors).length, 0);
});
test('validateForm: fails required with message', () => {
    const r = validateForm([{ name: 'a', required: true, requiredMessage: 'A必填' }], { a: '' });
    assert.equal(r.ok, false);
    assert.equal(r.firstError, 'A必填');
    assert.equal(r.errors.a, 'A必填');
});
test('validateForm: fails duplicated name', () => {
    const r = validateForm([
        { name: 'a', required: false },
        { name: 'a', required: false },
    ], { a: '1' });
    assert.equal(r.ok, false);
    assert.match(r.errors.a, /字段名重复/);
});

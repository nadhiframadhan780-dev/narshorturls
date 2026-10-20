import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  isValidUrl,
  isSelfDomain,
  generateBase62Code,
  buildUtmUrl,
  hashIp,
  detectDevice,
  getDeviceTargetedUrl,
  checkLinkStatus,
} from './shortener.ts';

test('normalizeUrl prepends https to bare domains', () => {
  assert.equal(normalizeUrl('example.com/path'), 'https://example.com/path');
  assert.equal(normalizeUrl('https://example.com'), 'https://example.com');
  assert.equal(normalizeUrl('http://test.org'), 'http://test.org');
});

test('isValidUrl recognizes valid and invalid URLs', () => {
  assert.equal(isValidUrl('https://stripe.com'), true);
  assert.equal(isValidUrl('http://sub.domain.co.id/promo?ref=1'), true);
  assert.equal(isValidUrl('not-a-valid-url'), false);
  assert.equal(isValidUrl('javascript:alert(1)'), false);
});

test('isSelfDomain prevents recursive shortener loops', () => {
  assert.equal(isSelfDomain('https://narshort.url/promo', 'narshort.url'), true);
  assert.equal(isSelfDomain('http://api.narshort.url/link', 'narshort.url'), true);
  assert.equal(isSelfDomain('https://google.com', 'narshort.url'), false);
});

test('generateBase62Code produces random alphanumeric codes of specified length', () => {
  const code6 = generateBase62Code(6);
  const code7 = generateBase62Code(7);
  assert.equal(code6.length, 6);
  assert.equal(code7.length, 7);
  assert.match(code6, /^[0-9a-zA-Z]{6}$/);
});

test('buildUtmUrl attaches query parameters properly', () => {
  const target = buildUtmUrl('https://example.com/landing', {
    source: 'newsletter',
    medium: 'email',
    campaign: 'summer_promo',
  });
  assert.match(target, /utm_source=newsletter/);
  assert.match(target, /utm_medium=email/);
  assert.match(target, /utm_campaign=summer_promo/);
});

test('hashIp creates consistent anonymized sha256 hashes', () => {
  const hash1 = hashIp('192.168.1.1');
  const hash2 = hashIp('192.168.1.1');
  const hash3 = hashIp('10.0.0.1');
  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hash3);
  assert.equal(hash1.length, 16);
});

test('detectDevice identifies iOS, Android, and Desktop user agents', () => {
  assert.equal(detectDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)'), 'ios');
  assert.equal(detectDevice('Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36'), 'android');
  assert.equal(detectDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'), 'desktop');
});

test('getDeviceTargetedUrl redirects to specialized URL when configured', () => {
  const link = {
    originalUrl: 'https://example.com/web',
    iosUrl: 'https://apps.apple.com/app/my-app',
    androidUrl: 'https://play.google.com/store/apps/details?id=my.app',
  };

  const iosTarget = getDeviceTargetedUrl(link, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5)');
  assert.equal(iosTarget, 'https://apps.apple.com/app/my-app');

  const androidTarget = getDeviceTargetedUrl(link, 'Mozilla/5.0 (Linux; Android 13)');
  assert.equal(androidTarget, 'https://play.google.com/store/apps/details?id=my.app');

  const desktopTarget = getDeviceTargetedUrl(link, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
  assert.equal(desktopTarget, 'https://example.com/web');
});

test('checkLinkStatus handles expiry, max clicks, password and blocked status', () => {
  assert.deepEqual(checkLinkStatus({ isActive: true }), { allowed: true });
  assert.deepEqual(checkLinkStatus({ isActive: false }), { allowed: false, reason: 'inactive' });
  assert.deepEqual(checkLinkStatus({ isActive: true, isBlocked: true }), { allowed: false, reason: 'blocked' });
  assert.deepEqual(checkLinkStatus({
    isActive: true,
    expiresAt: new Date(Date.now() - 10000).toISOString()
  }), { allowed: false, reason: 'expired' });
  assert.deepEqual(checkLinkStatus({
    isActive: true,
    maxClicks: 5,
    clickCount: 5
  }), { allowed: false, reason: 'max_clicks_reached' });
  assert.deepEqual(checkLinkStatus({
    isActive: true,
    hasPassword: true
  }), { allowed: false, reason: 'password_required' });
});

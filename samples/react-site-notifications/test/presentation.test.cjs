const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.sharepoint.com/sites/test' });
Object.assign(global, {
  window: dom.window, document: dom.window.document,
  HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
  Node: dom.window.Node, MutationObserver: dom.window.MutationObserver,
  getComputedStyle: dom.window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true
});
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
window.requestAnimationFrame = callback => setTimeout(callback, 0);
window.cancelAnimationFrame = clearTimeout;
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;
require.extensions['.scss'] = module => {
  module.exports = Object.fromEntries(
    ['notification', 'warning', 'error', 'icon', 'banner', 'row', 'visuallyHidden', 'message',
      'close', 'action', 'region', 'stack', 'warningMessage', 'modal', 'admin', 'actions', 'primaryAction',
      'statusGrid', 'setupStep', 'diagnostics', 'panel', 'panelHeading', 'visibility', 'hint', 'manageItem'].map(name => [name, name])
  );
};
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, esModuleInterop: true
      }
    }).outputText;
    module._compile(output, filename);
  };
}
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const corePath = require.resolve('@microsoft/sp-core-library');
require.cache[corePath] = { id: corePath, filename: corePath, loaded: true, exports: { Log: { error() {} } } };
const httpPath = require.resolve('@microsoft/sp-http');
require.cache[httpPath] = {
  id: httpPath, filename: httpPath, loaded: true, exports: { SPHttpClient: { configurations: { v1: {} } } }
};
const { Banner } = require('../src/shared/Banner.tsx');
const { dismissalKey } = require('../src/shared/dismissals.ts');
const { NotificationService } = require('../src/shared/NotificationService.ts');
const { GuidedSetup } = require('../src/webparts/notificationAdmin/components/GuidedSetup.ts');
const NotificationAdmin = require('../src/webparts/notificationAdmin/components/NotificationAdmin.tsx').default;
const rootUrl = 'https://example.sharepoint.com/sites/test';
const item = {
  id: 1, type: 'Notification', message: '<p>Test message</p>',
  isModal: false, isDismissible: false, fingerprint: 'a'.repeat(64)
};

test('presentation, browser dismissal, modal cards and modal queue', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const render = async (items, key = 'page') => act(async () => {
    root.render(React.createElement(Banner, { items, collectionUrl: rootUrl, key }));
  });

  const button = name => [...document.querySelectorAll('button')].find(element =>
    name === 'Close' ? element.getAttribute('aria-label')?.startsWith('Dismiss ')
      : name === 'Close dialog' ? element.getAttribute('aria-label')?.startsWith('Close ')
        : element.textContent === name);
  const click = async name => {
    assert.ok(button(name), `Expected ${name} button`);
    await act(async () => button(name).click());
  };
  await render([item]);
  assert.match(document.body.textContent, /Test message/);
  assert.equal(button('Close'), undefined);
  assert.equal(document.querySelector('svg')?.getAttribute('aria-hidden'), 'true');
  assert.equal(document.querySelector('.row .visuallyHidden')?.textContent, 'Notification: ');
  assert.match(document.querySelector('.row .message')?.textContent, /Test message/);

  await render([{ ...item, id: 7, type: 'Error', isDismissible: true }], 'error-icon');
  const errorIcon = container.querySelector('svg');
  assert.equal(errorIcon.getAttribute('aria-hidden'), 'true');
  assert.equal(errorIcon.querySelector('polygon').getAttribute('points').trim().split(/\s+/).length, 8);
  assert.ok(errorIcon.querySelector('path[d="M12 9v5"]'));
  assert.ok(errorIcon.querySelector('path[d="M12 17h.01"]'));
  assert.equal(container.querySelector('.visuallyHidden').textContent, 'Error: ');
  assert.equal(button('Close').getAttribute('aria-label'), 'Dismiss Error notification');
  assert.equal(button('Close').textContent, '\u00d7');

  await render([{ ...item, isDismissible: true }]);
  assert.equal(button('Close').getAttribute('aria-label'), 'Dismiss Notification notification');
  assert.equal(button('Close').textContent, '\u00d7');
  await click('Close');
  assert.doesNotMatch(document.body.textContent, /Test message/);
  await render([{ ...item, isDismissible: true }], 'reload');
  assert.doesNotMatch(document.body.textContent, /Test message/);
  await render([{ ...item, isDismissible: true, fingerprint: 'b'.repeat(64) }], 'new-content');
  assert.match(document.body.textContent, /Test message/);

  const modal = { ...item, id: 2, isModal: true };
  const next = { ...modal, id: 3, message: '<p>Second modal</p>' };
  await render([modal, next], 'modal');
  const dialog = document.querySelector('[role="alertdialog"], [role="dialog"]');
  assert.ok(dialog);
  assert.equal(document.getElementById(dialog.getAttribute('aria-labelledby'))?.textContent, 'Notification: ');
  assert.equal(document.getElementById(dialog.getAttribute('aria-describedby'))?.textContent, 'Test message');
  assert.equal(getComputedStyle(dialog.querySelector('.ms-Dialog-main')).minHeight, '0px');
  assert.doesNotMatch(document.body.textContent, /Second modal/);
  await click('OK');
  assert.match(container.querySelector('.stack').textContent, /Test message/);
  assert.equal(container.querySelector('.stack button'), null);
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, modal.id)), null);
  assert.match(document.body.textContent, /Second modal/);
  const nextDialog = document.querySelector('[role="alertdialog"], [role="dialog"]');
  assert.equal(document.getElementById(nextDialog.getAttribute('aria-describedby'))?.textContent, 'Second modal');
  await click('OK');
  assert.equal(document.querySelector('[role="alertdialog"], [role="dialog"]'), null);
  const cards = container.querySelectorAll('.stack section');
  assert.equal(cards.length, 2);
  assert.match(cards[1].textContent, /Second modal/);
  assert.equal(cards[0].querySelector('button'), null);
  assert.match(container.querySelector('.stack').textContent, /Second modal/);
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, modal.id)), null);
  await render([modal, next], 'modal');
  assert.match(container.querySelector('.stack').textContent, /Test message/);
  assert.match(container.querySelector('.stack').textContent, /Second modal/);
  await render([modal], 'navigation');
  assert.ok(document.querySelector('[role="alertdialog"], [role="dialog"]'));
  assert.equal(container.querySelector('.stack').textContent, '');
  await click('OK');
  await render([{ ...modal, fingerprint: 'c'.repeat(64) }], 'navigation');
  assert.ok(document.querySelector('[role="alertdialog"], [role="dialog"]'));
  await render([{ ...modal, isDismissible: true }], 'dismiss-modal');
  await click('Close dialog');
  assert.match(container.querySelector('.stack').textContent, /Test message/);
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, modal.id)), null);
  await render([{ ...modal, isDismissible: true }], 'modal-reload');
  assert.ok(document.querySelector('[role="alertdialog"], [role="dialog"]'));
  await click('Close dialog');
  await click('Close');
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, modal.id)), modal.fingerprint);
  await render([{ ...modal, isDismissible: true }], 'modal-reload-again');
  assert.doesNotMatch(document.body.textContent, /Test message/);

  await render([{ ...item, isDismissible: true }], 'preview');
  await act(async () => root.render(React.createElement(Banner, {
    items: [{ ...item, isDismissible: true }], collectionUrl: rootUrl, preview: true, key: 'preview'
  })));
  assert.match(document.body.textContent, /Test message/);
  const previewModal = { ...modal, id: 6 };
  await act(async () => root.render(React.createElement(Banner, {
    items: [previewModal], collectionUrl: rootUrl, preview: true, key: 'preview-persistent-modal'
  })));
  await click('OK');
  assert.match(container.querySelector('.stack').textContent, /Test message/);
  assert.equal(container.querySelector('.stack button'), null);
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, previewModal.id)), null);
  await act(async () => root.render(React.createElement(Banner, {
    items: [{ ...previewModal, isDismissible: true }], collectionUrl: rootUrl, preview: true, key: 'preview-dismissible-modal'
  })));
  await click('Close dialog');
  await click('Close');
  assert.doesNotMatch(container.querySelector('.stack').textContent, /Test message/);
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, previewModal.id)), null);
  const linkedItem = { ...item, message: '<p><a href="https://example.com">Read more</a></p>' };
  await act(async () => root.render(React.createElement(Banner, {
    items: [linkedItem], collectionUrl: rootUrl, preview: true, key: 'preview-link'
  })));
  const previewLink = container.querySelector('a');
  assert.equal(previewLink.target, '_blank');
  assert.equal(previewLink.rel, 'noopener noreferrer');
  assert.equal(previewLink.getAttribute('aria-label'), 'Read more (opens in new tab)');
  await render([linkedItem], 'page-link');
  assert.equal(container.querySelector('a').hasAttribute('target'), false);

  const escapeModal = { ...modal, id: 4, isDismissible: true };
  await render([escapeModal], 'escape');
  assert.ok(button('Close dialog'));
  await act(async () => button('Close dialog').dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.match(container.querySelector('.stack').textContent, /Test message/);
  assert.equal(window.localStorage.getItem(dismissalKey(rootUrl, escapeModal.id)), null);

  const originalStorage = window.localStorage;
  Object.defineProperty(window, 'localStorage', {
    configurable: true, value: { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } }
  });
  await render([{ ...item, id: 5, isDismissible: true }], 'blocked');
  await click('Close');
  assert.doesNotMatch(document.body.textContent, /Test message/);
  assert.match(document.body.textContent, /could not be remembered/);
  Object.defineProperty(window, 'localStorage', { configurable: true, value: originalStorage });
  await act(async () => root.unmount());
  container.remove();
});

test('list loading fingerprints message and severity, not display settings', async () => {
  let row = {
    Id: 1, Message: '<p>Hello</p>', NotificationType: 'Notification', TargetSiteUrl: { Url: rootUrl },
    IncludeSubsites: false, IsActive: true, IsModal: false, IsDismissible: true,
    StartDateTime: null, EndDateTime: null
  };
  let url = '';
  const service = new NotificationService({
    async get(requestUrl) {
      url = requestUrl;
      return { ok: true, async json() { return { value: [row] }; } };
    }
  }, rootUrl);
  const load = async () => (await service.load(new AbortController().signal, true))[0];
  const original = await load();
  assert.match(url, /IsModal,IsDismissible/);
  assert.equal(original.item.isDismissible, true);
  row = { ...row, IsModal: true };
  assert.equal((await load()).item.fingerprint, original.item.fingerprint);
  row = { ...row, Message: '<p>Changed</p>' };
  assert.notEqual((await load()).item.fingerprint, original.item.fingerprint);
  row = { ...row, Message: '<p>Hello</p>', NotificationType: 'Error' };
  assert.notEqual((await load()).item.fingerprint, original.item.fingerprint);
  row = { ...row, IsModal: null };
  assert.match((await load()).errors.join(' '), /Modal is invalid/);
});

test('site-targeted loading preserves validation and scheduled items while skipping unrelated fingerprints', async () => {
  const currentUrl = `${rootUrl}/Payroll`;
  const row = {
    Message: '<p>Hello</p>', NotificationType: 'Notification', IsActive: true,
    IsModal: false, IsDismissible: true, StartDateTime: null, EndDateTime: null
  };
  const rows = [
    { ...row, Id: 1, TargetSiteUrl: { Url: rootUrl }, IncludeSubsites: true },
    { ...row, Id: 2, TargetSiteUrl: { Url: `${rootUrl}/Other` }, IncludeSubsites: false },
    { ...row, Id: 3, TargetSiteUrl: { Url: currentUrl }, IncludeSubsites: false, StartDateTime: '2099-01-01T00:00:00Z' },
    { ...row, Id: 4, TargetSiteUrl: { Url: `${rootUrl}/Other` }, IncludeSubsites: false, Message: '<p></p>' }
  ];
  const service = new NotificationService({
    async get() { return { ok: true, async json() { return { value: rows }; } }; }
  }, rootUrl);
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  const originalCrypto = globalThis.crypto;
  let digests = 0;
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { subtle: { digest(...args) { digests++; return originalCrypto.subtle.digest(...args); } } }
  });
  try {
    const targeted = await service.load(new AbortController().signal, true, currentUrl);
    assert.deepEqual(targeted.map(record => record.id), [1, 3, 4]);
    assert.equal(digests, 2);
    assert.equal(targeted[1].item.startDateTime, '2099-01-01T00:00:00Z');
    assert.match(targeted[2].errors.join(' '), /visible text/);
    digests = 0;
    const all = await service.load(new AbortController().signal, false);
    assert.deepEqual(all.map(record => record.id), [1, 2, 3, 4]);
    assert.equal(digests, 3);
    assert.equal(targeted[0].item.fingerprint, all[0].item.fingerprint);
    assert.equal(targeted[1].item.fingerprint, all[2].item.fingerprint);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    else delete globalThis.crypto;
  }
});

function setupFixture() {
  const state = {
    lists: [], fields: [], webActions: [], siteActions: [], writes: [], failField: false,
    failListRead: false, mismatchedId: false, failActionResponse: false, hidden: false,
    ignoreHide: false, failHideWrite: false, failHiddenRead: false, failAfterVisibilityWrite: false
  };
  const response = value => ({ ok: true, async json() { return value; } });
  const list = () => ({ Id: '12345678-1234-1234-1234-123456789abc', Title: 'Site Notifications', RootFolder: { ServerRelativeUrl: '/sites/test/Lists/SiteNotifications' } });
  const createField = xml => {
    const element = new dom.window.DOMParser().parseFromString(xml, 'application/xml').documentElement;
    return {
      InternalName: element.getAttribute('Name'), TypeAsString: element.getAttribute('Type'),
      Required: element.getAttribute('Required') === 'TRUE', Indexed: element.getAttribute('Indexed') === 'TRUE',
      Hidden: false, ReadOnlyField: false, DefaultValue: element.querySelector('Default')?.textContent ?? null, SchemaXml: xml
    };
  };
  const client = {
    async get(url) {
      if (url.includes('/_api/web/lists?')) {
        return state.failListRead ? { ok: false, status: 403 } : response({ value: state.lists });
      }
      if (url.includes('/_api/web/usercustomactions?')) return response({ value: state.webActions });
      if (url.includes('/_api/site/usercustomactions?')) return response({ value: state.siteActions });
      if (url.includes('/fields?')) return response({ value: state.fields });
      if (url.includes('/GetList(@list)?$select=Hidden&')) {
        return state.failHiddenRead ? { ok: false, status: 403 } : response({ Hidden: state.hidden });
      }
      if (url.includes('/GetList(@list)?')) return response({ Title: 'Site Notifications', BaseTemplate: 100, EnableVersioning: true });
      throw new Error(`Unexpected GET ${url}`);
    },
    async post(url, _config, options) {
      const body = JSON.parse(options.body);
      state.writes.push({ url, body });
      if (url.endsWith('/lists/add')) {
        state.lists = [list()];
        state.fields = [createField('<Field Name="Title" Type="Text" />')];
        return response({ Id: state.mismatchedId ? 'different-id' : list().Id });
      }
      if (url.includes('/GetList(@list)?') && typeof body.Hidden === 'boolean') {
        if (state.failHideWrite) return { ok: false, status: 403 };
        if (!state.ignoreHide) state.hidden = body.Hidden;
        if (state.failAfterVisibilityWrite) return { ok: false, status: 503 };
      }
      if (url.includes('/fields/createfieldasxml')) {
        if (state.failField) return { ok: false, status: 403 };
        state.fields.push(createField(body.parameters.SchemaXml));
      }
      if (url.endsWith('/site/usercustomactions')) {
        state.siteActions.push(body);
        if (state.failActionResponse) return { ok: false, status: 503 };
      }
      return response({});
    }
  };
  return { state, client, setup: new GuidedSetup(client, rootUrl) };
}

test('guided setup creates and verifies once, requires confirmation, and detects conflicts', async () => {
  global.DOMParser = dom.window.DOMParser;
  const { setup, state } = setupFixture();
  const signal = new AbortController().signal;
  await assert.rejects(() => setup.activate(false, signal), /Confirm/);
  assert.equal(state.writes.length, 0);
  assert.match(await setup.createOrCheckList(signal), /created and schema verified/);
  assert.equal(state.fields.length, 10);
  assert.equal(state.hidden, true);
  assert.equal(state.fields.find(field => field.InternalName === 'IsDismissible').DefaultValue, '1');
  const afterList = state.writes.length;
  state.hidden = false;
  assert.match(await setup.createOrCheckList(signal), /Existing/);
  assert.equal(state.writes.length, afterList);
  assert.equal(state.hidden, false);
  assert.equal(await setup.activate(true, signal),
    'Site-collection extension registration verified. Verify banner display and visitor access on your site.');
  const afterActivation = state.writes.length;
  await setup.activate(true, signal);
  assert.equal(state.writes.length, afterActivation);
  state.siteActions.push({ ...state.siteActions[0] });
  await assert.rejects(() => setup.activate(true, signal), /registration is conflicting/);
  assert.equal(state.writes.length, afterActivation);
  state.siteActions.pop();
  state.webActions.push({ Name: 'other', Location: 'other', ClientSideComponentId: '50e2a56c-f19f-40f5-8d8a-fc4d073da842', ClientSideComponentProperties: null });
  await assert.rejects(() => setup.activate(true, signal), /root-web/);
  assert.equal(state.writes.length, afterActivation);
  state.webActions = [];
  state.fields.find(field => field.InternalName === 'IsActive').Indexed = false;
  await assert.rejects(() => setup.activate(true, signal), /IsActive must be indexed/);
  assert.equal(state.writes.length, afterActivation);
});

test('guided setup reports failure when a new list cannot be verified as hidden', async () => {
  const signal = new AbortController().signal;
  const notHidden = setupFixture();
  notHidden.state.ignoreHide = true;
  await assert.rejects(() => notHidden.setup.createOrCheckList(signal), /partial list may remain.*could not be verified as hidden/);
  assert.equal(notHidden.state.lists.length, 1);
  const writeDenied = setupFixture();
  writeDenied.state.failHideWrite = true;
  await assert.rejects(() => writeDenied.setup.createOrCheckList(signal), /partial list may remain.*HTTP 403/);
  const denied = setupFixture();
  denied.state.failHiddenRead = true;
  await assert.rejects(() => denied.setup.createOrCheckList(signal), /visibility check failed \(HTTP 403\)/);
});

test('visibility changes require a ready list and verify the resulting setting', async () => {
  global.DOMParser = dom.window.DOMParser;
  const { setup, state } = setupFixture();
  const signal = new AbortController().signal;
  await assert.rejects(() => setup.setListVisibility(false, signal), /list must be ready/);
  assert.equal(state.writes.length, 0);
  await setup.createOrCheckList(signal);
  const initialWrites = state.writes.length;
  assert.match(await setup.setListVisibility(true, signal), /already hidden/);
  assert.equal(state.writes.length, initialWrites);
  assert.match(await setup.setListVisibility(false, signal), /visible in Site contents/);
  assert.equal(state.hidden, false);
  assert.deepEqual(state.writes.at(-1).body, { __metadata: { type: 'SP.List' }, Hidden: false });
  state.ignoreHide = true;
  await assert.rejects(() => setup.setListVisibility(true, signal), /could not be changed or verified/);
  assert.equal(state.hidden, false);
  state.ignoreHide = false;
  state.fields.find(field => field.InternalName === 'IsActive').Indexed = false;
  const writes = state.writes.length;
  await assert.rejects(() => setup.setListVisibility(true, signal), /list must be ready/);
  assert.equal(state.writes.length, writes);
});

test('admin can show or hide a ready list and handles unverified visibility', async () => {
  global.DOMParser = dom.window.DOMParser;
  const { setup, state, client } = setupFixture();
  await setup.createOrCheckList(new AbortController().signal);
  const get = client.get;
  client.get = async url => url.includes('/items?')
    ? { ok: true, async json() { return { value: [] }; } }
    : get(url);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const button = name => [...container.querySelectorAll('button')].find(element => element.textContent.trim() === name);
  const initialWrites = state.writes.length;
  await act(async () => root.render(React.createElement(NotificationAdmin, { client, rootUrl })));
  assert.equal(state.writes.length, initialWrites);
  assert.equal(button('Show in Site Contents').closest('details'), null);
  assert.ok([...container.querySelectorAll('details')].every(section => !section.open));
  assert.match(container.textContent, /Notification list visibility: Hidden/);
  await act(async () => button('Show in Site Contents').click());
  assert.equal(state.hidden, false);
  assert.match(container.textContent, /Notification list visibility: Visible/);
  assert.ok(button('Hide from Site Contents'));
  await act(async () => button('Hide from Site Contents').click());
  assert.equal(state.hidden, true);
  assert.match(container.textContent, /Notification list visibility: Hidden/);
  await act(async () => button('Show in Site Contents').click());
  state.failAfterVisibilityWrite = true;
  await act(async () => button('Hide from Site Contents').click());
  assert.equal(state.hidden, true);
  assert.match(container.textContent, /visibility could not be changed or verified/);
  assert.match(container.textContent, /Notification list visibility: Hidden/);
  state.failAfterVisibilityWrite = false;
  state.failHiddenRead = true;
  await act(async () => button('Refresh status').click());
  assert.match(container.textContent, /List visibility could not be verified/);
  assert.equal(button('Show in Site Contents'), undefined);
  assert.equal(button('Hide from Site Contents'), undefined);
  await act(async () => root.unmount());
  container.remove();
});

test('guided setup reports partial creation and never overwrites a partial or conflicting list', async () => {
  global.DOMParser = dom.window.DOMParser;
  const { setup, state } = setupFixture();
  const signal = new AbortController().signal;
  state.failField = true;
  await assert.rejects(() => setup.createOrCheckList(signal), /partial list may remain/);
  const writes = state.writes.length;
  state.failField = false;
  await assert.rejects(() => setup.createOrCheckList(signal), /Missing field: Message/);
  assert.equal(state.writes.length, writes);
  state.lists = [{ Id: 'other', Title: 'Site Notifications', RootFolder: { ServerRelativeUrl: '/sites/test/Lists/Other' } }];
  await assert.rejects(() => setup.createOrCheckList(signal), /different URL/);
  assert.equal(state.writes.length, writes);
});

test('guided setup stops on read failure and ambiguous creation outcomes', async () => {
  global.DOMParser = dom.window.DOMParser;
  const signal = new AbortController().signal;
  const denied = setupFixture();
  denied.state.failListRead = true;
  await assert.rejects(() => denied.setup.createOrCheckList(signal), /HTTP 403/);
  assert.equal(denied.state.writes.length, 0);

  const mismatch = setupFixture();
  mismatch.state.mismatchedId = true;
  await assert.rejects(() => mismatch.setup.createOrCheckList(signal), /partial list may remain/);
  assert.equal(mismatch.state.writes.length, 1);

  const registration = setupFixture();
  await registration.setup.createOrCheckList(signal);
  registration.state.failActionResponse = true;
  await assert.rejects(() => registration.setup.activate(true, signal), /may have been created.*inspect registrations/);
  assert.equal(registration.state.siteActions.length, 1);
});

test('admin setup requires permission confirmation and target errors remain advisory', async () => {
  global.DOMParser = dom.window.DOMParser;
  const fixture = setupFixture();
  await fixture.setup.createOrCheckList(new AbortController().signal);
  const row = {
    Id: 41, Message: '<p>Hello</p>', NotificationType: 'Warning', TargetSiteUrl: { Url: rootUrl },
    IncludeSubsites: false, IsActive: false, IsModal: false, IsDismissible: false,
    StartDateTime: null, EndDateTime: null
  };
  let targetStatus = 404;
  const client = {
    async get(url) {
      if (url.includes('/items?')) return { ok: true, async json() { return { value: [row] }; } };
      if (url.includes('/_api/web?$select=Url')) return { ok: false, status: targetStatus };
      return fixture.client.get(url);
    }
  };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(NotificationAdmin, { client, rootUrl })));
  const activate = [...container.querySelectorAll('button')].find(element => element.textContent === 'Activate Site Notifications extension');
  assert.ok(activate);
  assert.equal(activate.disabled, true);
  const checkbox = container.querySelector('input[type="checkbox"]');
  await act(async () => checkbox.click());
  assert.equal(activate.disabled, false);
  const select = container.querySelector('select');
  await act(async () => {
    select.value = '41';
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
  });
  const verify = [...container.querySelectorAll('button')].find(element => element.textContent === 'Verify target site');
  assert.ok(verify);
  assert.match(container.textContent, /Uses your access; it does not verify visitor permissions/);
  assert.match(container.textContent, /Loaded 1 notification\./);
  await act(async () => verify.click());
  assert.match(container.textContent, /not found or is inaccessible/);
  targetStatus = 403;
  await act(async () => verify.click());
  assert.match(container.textContent, /access was denied/);
  targetStatus = 503;
  await act(async () => verify.click());
  assert.match(container.textContent, /verification is incomplete/);
  await act(async () => root.unmount());
  container.remove();
});

test('admin progresses from setup to a read-only dashboard and refreshes current status', async () => {
  global.DOMParser = dom.window.DOMParser;
  const { setup, state, client } = setupFixture();
  const get = client.get;
  client.get = async url => url.includes('/items?')
    ? { ok: true, async json() { return { value: [] }; } }
    : get(url);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const button = name => [...container.querySelectorAll('button')].find(element => element.textContent === name);
  await act(async () => root.render(React.createElement(NotificationAdmin, { client, rootUrl })));
  assert.match(container.textContent, /List: Not found/);
  assert.ok(button('Create notification list'));
  assert.equal([...container.querySelectorAll('a')].some(link => link.textContent.includes('Open Site Notification list')), false);
  assert.equal([...container.querySelectorAll('a')].some(link => link.textContent.includes('Open Site Notification list settings')), false);
  assert.equal(state.writes.length, 0);

  await act(async () => button('Create notification list').click());
  assert.match(container.textContent, /List: Ready/);
  assert.match(container.textContent, /Step 2: Configure permissions/);
  const listLink = [...container.querySelectorAll('a')].find(link => link.textContent.includes('Open Site Notification list'));
  const permissionsLink = [...container.querySelectorAll('a')].find(link => link.textContent.includes('Open Site Notification list settings'));
  assert.equal(listLink.href, `${rootUrl}/Lists/SiteNotifications`);
  assert.equal(permissionsLink.href, `${rootUrl}/_layouts/15/listedit.aspx?List=%7B12345678-1234-1234-1234-123456789abc%7D`);
  const manage = permissionsLink.closest('section');
  const activateStep = button('Activate Site Notifications extension').closest('div');
  assert.ok(manage.contains(activateStep));
  assert.ok(permissionsLink.compareDocumentPosition(activateStep) & window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.match(container.textContent, /No notifications yet\. Create one in the list, then refresh status\./);
  for (const link of [listLink, permissionsLink]) {
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
    assert.match(link.textContent, /new tab/);
  }
  assert.equal(button('Activate Site Notifications extension').disabled, true);
  await act(async () => container.querySelector('input[type="checkbox"]').click());
  await act(async () => button('Activate Site Notifications extension').click());
  assert.match(container.textContent, /Extension: Registered/);
  assert.match(container.textContent, /Permissions: Administrator verification required/);
  assert.match(container.textContent, /does not confirm visitor access/);
  assert.equal(button('Activate Site Notifications extension'), undefined);
  assert.equal(button('Create notification list'), undefined);
  const sections = [...container.querySelectorAll('details')];
  assert.deepEqual(sections.map(section => section.querySelector('summary').textContent),
    ['About site notifications', 'Setup and diagnostics']);
  assert.ok(sections.every(section => !section.open));
  const heading = container.querySelector('h2');
  assert.equal(heading.nextElementSibling, sections[0]);
  assert.equal(sections[0].nextElementSibling, sections[1]);
  assert.ok(sections[1].nextElementSibling.contains(button('Refresh status')));
  const panels = [...container.querySelectorAll('section[aria-labelledby]')];
  assert.deepEqual(panels.map(panel => document.getElementById(panel.getAttribute('aria-labelledby')).textContent),
    ['Site status', 'Manage notifications', 'Preview saved notification']);
  assert.ok(panels[1].contains(button('Show in Site Contents')));
  assert.ok([...panels[1].querySelectorAll('a')].some(link => link.textContent.includes('Open Site Notification list settings')));
  assert.ok(panels[2].querySelector('select'));
  const diagnosticLinks = [...sections[1].querySelectorAll('a')];
  assert.equal(diagnosticLinks.length, 2);
  for (const [index, scope] of ['site', 'web'].entries()) {
    const url = new URL(diagnosticLinks[index].href);
    assert.equal(url.pathname, `/sites/test/_api/${scope}/usercustomactions`);
    assert.equal(url.searchParams.get('$select'), 'Name,Location,ClientSideComponentId,ClientSideComponentProperties');
    assert.equal(url.searchParams.get('$top'), '5000');
    assert.equal(diagnosticLinks[index].target, '_blank');
    assert.equal(diagnosticLinks[index].rel, 'noopener noreferrer');
    assert.match(diagnosticLinks[index].textContent, /opens in new tab/);
  }
  await act(async () => sections[0].querySelector('summary').click());
  assert.equal(sections[0].open, true);
  assert.equal(sections[1].open, false);
  assert.match(container.textContent, /Previewing does not publish/);

  const writes = state.writes.length;
  await act(async () => button('Refresh status').click());
  assert.equal(state.writes.length, writes);
  assert.match(container.textContent, /Extension: Registered/);

  state.failListRead = true;
  await act(async () => button('Refresh status').click());
  assert.match(container.textContent, /List: Couldn't verify/);
  assert.doesNotMatch(container.textContent, /Step 1: Create/);
  assert.equal([...container.querySelectorAll('a')].some(link => link.textContent.includes('Open Site Notification list settings')), false);
  assert.ok([...container.querySelectorAll('a')].some(link => link.textContent.includes('Open Site Notification list')));
  assert.equal(state.writes.length, writes);
  state.failListRead = false;
  state.fields.find(field => field.InternalName === 'IsActive').Indexed = false;
  await act(async () => button('Refresh status').click());
  assert.match(container.textContent, /List: Needs attention/);
  assert.match(container.textContent, /IsActive must be indexed/);
  assert.ok([...container.querySelectorAll('a')].some(link => link.textContent.includes('Open Site Notification list settings')));
  assert.match(container.textContent, /inspect the existing list before retrying/);
  assert.equal(button('Create notification list'), undefined);
  await act(async () => root.unmount());
  container.remove();
});

test('admin rechecks after partial setup and prevents blind retries', async () => {
  global.DOMParser = dom.window.DOMParser;
  const { state, client } = setupFixture();
  state.failField = true;
  const get = client.get;
  client.get = async url => url.includes('/items?')
    ? { ok: true, async json() { return { value: [] }; } }
    : get(url);
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(React.createElement(NotificationAdmin, { client, rootUrl })));
  const create = [...container.querySelectorAll('button')].find(element => element.textContent === 'Create notification list');
  await act(async () => create.click());
  assert.match(container.textContent, /partial list may remain/);
  assert.match(container.textContent, /List: Needs attention/);
  assert.match(container.textContent, /Missing field: Message/);
  assert.equal([...container.querySelectorAll('button')].some(element => element.textContent === 'Create notification list'), false);
  await act(async () => root.unmount());
  container.remove();
});

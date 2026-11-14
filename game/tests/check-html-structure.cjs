const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const stack = [];
const parents = new Map();
for (const match of html.matchAll(/<\/?([a-zA-Z][\w:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/g)) {
  const tag = match[1].toLowerCase();
  if (match[0].startsWith('</')) {
    const open = stack.pop();
    assert.equal(open?.tag, tag, `Incorrect closing </${tag}> after <${open?.tag}> (${open?.id || ''})`);
  } else {
    const id = /\bid="([^"]+)"/.exec(match[0])?.[1];
    if (id) { assert.equal(parents.has(id), false, `Duplicate ID: ${id}`); parents.set(id, stack.at(-1)); }
    if (!voids.has(tag) && !match[0].endsWith('/>')) stack.push({tag,id});
  }
}
assert.equal(stack.length, 0, 'Unclosed HTML elements');
for (const id of ['orbital-math-modal','nasa-photo-modal','mission-intro','orbital-hangar',
  'adaptive-tutorial','partial-pause-button','partial-pause-dialog','recovery-status']) {
  assert.equal(parents.get(id)?.tag, 'body', `${id} must not inherit hidden modal state`);
}
console.log('PASS: balanced HTML, unique IDs and independent dialogs/controls outside hidden modal containers.');

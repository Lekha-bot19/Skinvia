// Tests for Skinvia's recommendation logic. Run with: node recommend.test.js
const assert = require('assert');
const { PRODUCTS, QUESTIONS } = require('./data.js');
const { recommend } = require('./recommend.js');

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('✅ PASS: ' + name); }
  catch (e) { console.log('❌ FAIL: ' + name + '\n   ' + e.message); process.exitCode = 1; }
}

const base = { feel: 'dry', concerns: ['tight'], sensitive: 'no', when: 'always', steps: '3', budget: 'any', safety: ['none'] };
const withAns = (changes) => Object.assign({}, base, changes);

test('Always returns exactly 3 picks', () => {
  assert.strictEqual(recommend(base, PRODUCTS).picks.length, 3);
});

test('Every pick has at least one reason', () => {
  recommend(base, PRODUCTS).picks.forEach(p => assert.ok(p.why.length >= 1 && p.why[0].length > 0));
});

test('Picks are from different routine steps', () => {
  const steps = recommend(base, PRODUCTS).picks.map(p => p.step);
  assert.strictEqual(new Set(steps).size, steps.length);
});

test('A moisturiser is always included', () => {
  assert.ok(recommend(base, PRODUCTS).picks.some(p => p.step === 'moisturise'));
});

test('Sensitive users never get exfoliating acids', () => {
  ['yes', 'sometimes'].forEach(s => {
    const r = recommend(withAns({ sensitive: s, concerns: ['dull', 'flaky'] }), PRODUCTS);
    assert.ok(!r.picks.some(p => p.id === 'lactic-serum'));
  });
});

test('Cracked skin never gets acids or urea', () => {
  const r = recommend(withAns({ safety: ['cracking'], concerns: ['flaky', 'dull'] }), PRODUCTS);
  assert.ok(!r.picks.some(p => p.id === 'lactic-serum' || p.id === 'urea-cream'));
});

test('Serious symptoms trigger the see-a-GP message', () => {
  ['cracking', 'eczema', 'severe'].forEach(s => {
    assert.strictEqual(recommend(withAns({ safety: [s] }), PRODUCTS).needsDoctor, true);
  });
});

test('No serious symptoms means no GP message', () => {
  assert.strictEqual(recommend(base, PRODUCTS).needsDoctor, false);
});

test('Dryness during the day gets an on-the-go product', () => {
  const r = recommend(withAns({ when: 'day', concerns: ['wearsoff'] }), PRODUCTS);
  assert.ok(r.picks.some(p => p.step === 'onthego'));
});

test('Combination skin does not get a heavy moisturiser', () => {
  const r = recommend(withAns({ feel: 'combination', concerns: ['dull'] }), PRODUCTS);
  assert.ok(!r.picks.some(p => p.step === 'moisturise' && PRODUCTS.find(x => x.id === p.id).rich));
});

test('Choosing 2 steps marks the third pick as optional', () => {
  const r = recommend(withAns({ steps: '2' }), PRODUCTS);
  assert.strictEqual(r.picks[2].optional, true);
  assert.strictEqual(r.picks[0].optional, false);
});

test('Morning routine always ends with sunscreen', () => {
  const m = recommend(base, PRODUCTS).routine.morning;
  assert.ok(/SPF|sunscreen/i.test(m[m.length - 1]));
});

test('Every possible quiz answer combination gives 3 valid picks', () => {
  const single = id => QUESTIONS.find(q => q.id === id).options.map(o => o.value);
  const concernsOpts = single('concerns');
  let combos = 0;
  single('feel').forEach(feel => single('sensitive').forEach(sensitive => single('when').forEach(when =>
    single('budget').forEach(budget => concernsOpts.forEach(c => ['none', 'cracking'].forEach(safety => {
      const r = recommend({ feel, concerns: [c], sensitive, when, steps: '3', budget, safety: [safety] }, PRODUCTS);
      assert.strictEqual(r.picks.length, 3, JSON.stringify({ feel, c, sensitive, when, budget, safety }));
      combos++;
    }))))));
  assert.ok(combos > 500);
});

test('Match % is honest: matched answers out of total answers', () => {
  recommend(withAns({ concerns: ['flaky', 'tight'] }), PRODUCTS).picks.forEach(p => {
    assert.strictEqual(p.factors, 4);
    assert.ok(p.matched >= 0 && p.matched <= p.factors);
    assert.strictEqual(p.match, Math.round(p.matched / p.factors * 100));
  });
});

test('Fit bars add up to the match score', () => {
  recommend(withAns({ concerns: ['flaky', 'wearsoff'], when: 'day' }), PRODUCTS).picks.forEach(p => {
    const fromBars = (p.fit.skin / 100) + (p.fit.concerns / 100) * 2 + (p.fit.timing / 100);
    assert.strictEqual(Math.round(fromBars), p.matched);
  });
});

console.log('\n' + passed + ' tests passed');

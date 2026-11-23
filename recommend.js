// Skinvia recommendation logic: turns quiz answers into 3 picks with reasons.
// Rule-based on purpose: predictable, explainable and easy to test.
(function (global) {
  'use strict';

  const CONCERN_TEXT = {
    flaky: 'flaky patches',
    tight: 'tightness',
    dull: 'dull, rough texture',
    redness: 'redness or irritation',
    wearsoff: 'moisturiser wearing off during the day'
  };
  const FEEL_TEXT = {
    dry: 'skin that feels tight or flaky',
    combination: 'skin that is dry in some areas and oily in others',
    normal: 'skin that is mostly comfortable'
  };
  const STEP_ORDER = ['cleanse', 'treat', 'moisturise', 'onthego', 'protect'];

  function needsDoctor(answers) {
    const s = answers.safety || [];
    return s.includes('cracking') || s.includes('eczema') || s.includes('severe');
  }

  function isAllowed(product, answers) {
    const sensitive = answers.sensitive === 'yes' || answers.sensitive === 'sometimes';
    const broken = (answers.safety || []).includes('cracking') || (answers.safety || []).includes('severe');
    if (!product.fragranceFree) return false;
    if (product.acid && (sensitive || broken)) return false;
    if (product.id === 'urea-cream' && (broken || answers.sensitive === 'yes')) return false;
    if (product.rich && answers.feel === 'combination' && product.step === 'moisturise') return false;
    return true;
  }

  function scoreProduct(product, answers) {
    let score = 0;
    const reasons = [];
    const fit = { feel: false, concerns: 0, when: false };
    if (product.goodFor.includes(answers.feel)) {
      fit.feel = true;
      score += 3;
      reasons.push('suits ' + FEEL_TEXT[answers.feel]);
    }
    (answers.concerns || []).forEach(function (c) {
      if (product.goodFor.includes(c)) {
        score += 2;
        fit.concerns++;
        reasons.push('helps with ' + CONCERN_TEXT[c]);
      }
    });
    const when = answers.when;
    if (when === 'day' && product.step === 'onthego') { score += 4; fit.when = true; reasons.push('easy to use when you are out'); }
    if (when === 'morning' && product.step === 'protect') { score += 3; fit.when = true; reasons.push('fits into your morning'); }
    if (when === 'night' && product.goodFor.includes('night')) { score += 3; fit.when = true; reasons.push('works well overnight'); }
    if (when === 'always' && product.step === 'moisturise') { score += 2; }
    if (answers.budget === 'low' && product.price === 'low') score += 1;
    if (answers.budget === 'low' && product.price !== 'low') score -= 1;
    if (answers.sensitive !== 'no' && product.goodFor.includes('redness')) score += 1;
    return { score: score, reasons: reasons, fit: fit };
  }

  function recommend(answers, products) {
    const candidates = products
      .filter(function (p) { return isAllowed(p, answers); })
      .map(function (p) {
        const s = scoreProduct(p, answers);
        return { product: p, score: s.score, reasons: s.reasons, fit: s.fit };
      })
      .sort(function (a, b) { return b.score - a.score || a.product.id.localeCompare(b.product.id); });

    const picks = [];
    const usedSteps = {};
    // Always include the best moisturiser: it is the core of any dry-skin routine.
    const moist = candidates.find(function (c) { return c.product.step === 'moisturise'; });
    if (moist) { picks.push(moist); usedSteps.moisturise = true; }
    candidates.forEach(function (c) {
      if (picks.length < 3 && !usedSteps[c.product.step]) {
        picks.push(c);
        usedSteps[c.product.step] = true;
      }
    });

    // Match % = how many of the user's answers this product fits (skin feel, each concern, when dryness is worst).
    const factors = 1 + (answers.concerns || []).length + 1;
    const result = picks.map(function (c, i) {
      const why = [c.product.reason].concat(c.reasons);
      const matched = Math.min(factors, c.reasons.length);
      return {
        id: c.product.id,
        name: c.product.name,
        form: c.product.form,
        label: c.product.label,
        step: c.product.step,
        ingredients: c.product.ingredients,
        where: c.product.where,
        price: c.product.price,
        why: why,
        optional: answers.steps === '2' && i === 2,
        matched: matched,
        factors: factors,
        match: Math.round((matched / factors) * 100),
        // Per-area fit, shown as bars on the results page.
        fit: {
          skin: c.fit.feel ? 100 : 0,
          concerns: (answers.concerns || []).length ? Math.round(c.fit.concerns / answers.concerns.length * 100) : 0,
          timing: c.fit.when ? 100 : 0
        }
      };
    });

    return {
      picks: result,
      needsDoctor: needsDoctor(answers),
      routine: buildRoutine(result, answers)
    };
  }

  function buildRoutine(picks, answers) {
    const byStep = {};
    picks.forEach(function (p) { byStep[p.step] = p; });
    const am = [];
    const pm = [];
    const day = [];
    am.push(byStep.cleanse ? byStep.cleanse.name : 'Rinse with lukewarm water');
    pm.push(byStep.cleanse ? byStep.cleanse.name : 'Rinse with lukewarm water');
    if (byStep.treat) {
      if (byStep.treat.id === 'lactic-serum') pm.push(byStep.treat.name + ' (2–3 nights a week)');
      else { am.push(byStep.treat.name); pm.push(byStep.treat.name); }
    }
    if (byStep.moisturise) { am.push(byStep.moisturise.name); pm.push(byStep.moisturise.name); }
    am.push(byStep.protect ? byStep.protect.name : 'Sunscreen SPF 30+ (any you like)');
    if (byStep.onthego) day.push(byStep.onthego.name + ' — whenever skin feels tight');
    else if (answers.when === 'day') day.push('Reapply your moisturiser at lunchtime if you can');
    return { morning: am, day: day, evening: pm };
  }

  const api = { recommend: recommend, isAllowed: isAllowed, scoreProduct: scoreProduct, needsDoctor: needsDoctor, STEP_ORDER: STEP_ORDER };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.SkinviaRecommend = api;
})(typeof window !== 'undefined' ? window : globalThis);

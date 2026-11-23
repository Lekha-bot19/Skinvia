// Skinvia data: quiz questions, product types and ingredients.
// Product types are ingredient-led (no brands), so the site makes no claims about specific products.
(function (global) {
  'use strict';

  const QUESTIONS = [
    {
      id: 'feel',
      title: 'How does your face feel a few hours after washing it?',
      help: 'Think about a normal day, without any products on.',
      type: 'single',
      options: [
        { value: 'dry', label: 'Tight, rough or flaky' },
        { value: 'combination', label: 'Dry in some places, oily on my nose and forehead' },
        { value: 'normal', label: 'Mostly comfortable, a little dry sometimes' }
      ]
    },
    {
      id: 'concerns',
      title: 'What bothers you most?',
      help: 'Pick up to two.',
      type: 'multi',
      max: 2,
      options: [
        { value: 'flaky', label: 'Flaky or peeling patches' },
        { value: 'tight', label: 'Tightness or discomfort' },
        { value: 'dull', label: 'Dull or rough texture' },
        { value: 'redness', label: 'Redness or irritation' },
        { value: 'wearsoff', label: 'Moisturiser wears off too quickly' }
      ]
    },
    {
      id: 'sensitive',
      title: 'Does your skin react to new products?',
      help: 'For example stinging, redness or itching.',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes, often' },
        { value: 'sometimes', label: 'Sometimes' },
        { value: 'no', label: 'Rarely or never' }
      ]
    },
    {
      id: 'when',
      title: 'When does dryness bother you most?',
      help: '',
      type: 'single',
      options: [
        { value: 'morning', label: 'In the morning' },
        { value: 'day', label: 'During the day, when I am out (work, sport, air-con)' },
        { value: 'night', label: 'At night' },
        { value: 'always', label: 'All the time' }
      ]
    },
    {
      id: 'steps',
      title: 'How many products are you happy to use?',
      help: 'Fewer is fine. A simple routine you keep is better than a long one you skip.',
      type: 'single',
      options: [
        { value: '2', label: '2 — keep it simple' },
        { value: '3', label: '3 — a basic routine' },
        { value: '4', label: '4 or more' }
      ]
    },
    {
      id: 'budget',
      title: 'What is your budget per product?',
      help: 'Prices are rough NZ ranges.',
      type: 'single',
      options: [
        { value: 'low', label: 'Under $20' },
        { value: 'mid', label: '$20 to $40' },
        { value: 'any', label: 'It does not matter' }
      ]
    },
    {
      id: 'safety',
      title: 'Do any of these apply to you right now?',
      help: 'This helps us know when a website is not enough.',
      type: 'multi',
      max: 4,
      options: [
        { value: 'cracking', label: 'Skin that cracks or bleeds' },
        { value: 'eczema', label: 'Diagnosed eczema or another skin condition' },
        { value: 'severe', label: 'A sudden, severe or spreading rash' },
        { value: 'none', label: 'None of these', exclusive: true }
      ]
    }
  ];

  // step: cleanse | treat | moisturise | onthego | protect
  const PRODUCTS = [
    {
      id: 'cream-cleanser', form: 'tube', label: 'Cream Cleanser', name: 'Cream or milky cleanser', step: 'cleanse', price: 'low',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Glycerin', 'Ceramides'],
      goodFor: ['dry', 'normal', 'combination', 'tight', 'flaky', 'redness'],
      reason: 'cleans without stripping the oils your skin needs',
      where: 'Pharmacy or supermarket'
    },
    {
      id: 'gel-cleanser', form: 'pump', label: 'Gel Cleanser', name: 'Gentle low-foam gel cleanser', step: 'cleanse', price: 'low',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Glycerin'],
      goodFor: ['combination', 'normal'],
      reason: 'handles an oily T-zone without drying out the rest of your face',
      where: 'Pharmacy or supermarket'
    },
    {
      id: 'ha-serum', form: 'dropper', label: 'Hyaluronic Acid', name: 'Hyaluronic acid serum', step: 'treat', price: 'low',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Hyaluronic acid', 'Glycerin'],
      goodFor: ['dry', 'normal', 'combination', 'tight', 'dull'],
      reason: 'draws water into the skin, which helps with tightness',
      where: 'Pharmacy or beauty store'
    },
    {
      id: 'niacinamide-serum', form: 'dropper', label: 'Niacinamide 5%', name: 'Niacinamide serum (5% or less)', step: 'treat', price: 'low',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Niacinamide'],
      goodFor: ['combination', 'redness', 'dull'],
      reason: 'supports the skin barrier and can help skin look calmer and more even',
      where: 'Pharmacy or beauty store'
    },
    {
      id: 'lactic-serum', form: 'dropper', label: 'Lactic Acid 5%', name: 'Gentle lactic acid exfoliant (5% or less)', step: 'treat', price: 'mid',
      fragranceFree: true, acid: true, rich: false,
      ingredients: ['Lactic acid'],
      goodFor: ['dull', 'flaky'],
      reason: 'gently lifts flaky, rough skin so moisturiser can work better',
      where: 'Pharmacy or beauty store'
    },
    {
      id: 'ceramide-cream', form: 'tube', label: 'Ceramide Cream', name: 'Ceramide moisturiser', step: 'moisturise', price: 'mid',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Ceramides', 'Glycerin', 'Niacinamide'],
      goodFor: ['dry', 'normal', 'combination', 'tight', 'flaky', 'redness'],
      reason: 'repairs the skin barrier so moisture stays in for longer',
      where: 'Pharmacy or supermarket'
    },
    {
      id: 'rich-cream', form: 'jar', label: 'Barrier Cream', name: 'Rich barrier cream with shea butter', step: 'moisturise', price: 'mid',
      fragranceFree: true, acid: false, rich: true,
      ingredients: ['Shea butter', 'Squalane', 'Ceramides'],
      goodFor: ['dry', 'flaky', 'tight', 'night'],
      reason: 'a thicker layer that protects very dry skin, especially overnight',
      where: 'Pharmacy'
    },
    {
      id: 'oat-cream', form: 'tube', label: 'Oat Cream', name: 'Colloidal oatmeal soothing cream', step: 'moisturise', price: 'low',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Colloidal oatmeal', 'Glycerin', 'Panthenol'],
      goodFor: ['redness', 'dry', 'tight'],
      reason: 'soothes skin that gets red, itchy or irritated',
      where: 'Pharmacy or supermarket'
    },
    {
      id: 'squalane-oil', form: 'dropper', label: 'Squalane', name: 'Squalane face oil', step: 'treat', price: 'mid',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Squalane'],
      goodFor: ['dry', 'flaky', 'night', 'tight'],
      reason: 'a light oil that seals moisture in; a few drops are enough',
      where: 'Pharmacy or beauty store'
    },
    {
      id: 'balm-stick', form: 'stick', label: 'Balm Stick', name: 'Moisturising balm stick for on the go', step: 'onthego', price: 'low',
      fragranceFree: true, acid: false, rich: true,
      ingredients: ['Petrolatum', 'Shea butter'],
      goodFor: ['day', 'wearsoff', 'flaky'],
      reason: 'fits in a pocket, so you can top up during the day without mess',
      where: 'Pharmacy or supermarket'
    },
    {
      id: 'hydrating-mist', form: 'mist', label: 'Hydrating Mist', name: 'Fragrance-free hydrating mist', step: 'onthego', price: 'low',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Glycerin', 'Panthenol'],
      goodFor: ['day', 'wearsoff', 'tight'],
      reason: 'a quick refresh over the top of your routine when skin feels tight',
      where: 'Pharmacy or beauty store'
    },
    {
      id: 'moisturising-spf', form: 'tube', label: 'SPF 30+', name: 'Moisturising sunscreen SPF 30+', step: 'protect', price: 'mid',
      fragranceFree: true, acid: false, rich: false,
      ingredients: ['Glycerin', 'Sunscreen filters'],
      goodFor: ['morning', 'day', 'dry', 'normal', 'combination'],
      reason: 'moisturises and protects from sun, which can make dryness worse',
      where: 'Pharmacy or supermarket'
    },
    {
      id: 'urea-cream', form: 'jar', label: 'Urea 5%', name: 'Urea cream (5% or less)', step: 'moisturise', price: 'low',
      fragranceFree: true, acid: false, rich: true,
      ingredients: ['Urea', 'Glycerin'],
      goodFor: ['flaky', 'dry', 'dull'],
      reason: 'softens rough, flaky patches and helps skin hold water',
      where: 'Pharmacy'
    }
  ];

  const INGREDIENTS = [
    { name: 'Ceramides', what: 'Fats that naturally hold your skin cells together, like mortar between bricks.', goodFor: 'Dry, tight or irritated skin. Helps repair the skin barrier.', watch: 'Very gentle. Suits most people.' },
    { name: 'Hyaluronic acid', what: 'A molecule that holds onto water. Despite the name, it is not an exfoliating acid.', goodFor: 'Tight, dehydrated skin.', watch: 'Works best on damp skin with a moisturiser on top.' },
    { name: 'Glycerin', what: 'A humectant: it draws water into the top layer of skin.', goodFor: 'Almost everyone with dry skin.', watch: 'Very gentle. Found in many products.' },
    { name: 'Squalane', what: 'A light, stable oil similar to the oils your skin makes.', goodFor: 'Dry skin that needs moisture sealed in.', watch: 'A few drops is enough.' },
    { name: 'Shea butter', what: 'A rich plant butter that forms a protective layer.', goodFor: 'Very dry or flaky skin, especially at night.', watch: 'Can feel heavy on oily areas.' },
    { name: 'Niacinamide', what: 'A form of vitamin B3.', goodFor: 'Supporting the skin barrier and calming the look of redness.', watch: 'High strengths (over 5%) can sting some people.' },
    { name: 'Colloidal oatmeal', what: 'Very finely ground oats.', goodFor: 'Itchy, red or irritated skin.', watch: 'Rarely, people with an oat allergy react to it.' },
    { name: 'Panthenol', what: 'Pro-vitamin B5.', goodFor: 'Soothing and softening skin.', watch: 'Very gentle.' },
    { name: 'Urea', what: 'A substance your skin makes naturally that helps it hold water.', goodFor: 'Rough, flaky patches.', watch: 'Can sting on broken or cracked skin.' },
    { name: 'Lactic acid', what: 'A mild exfoliating acid.', goodFor: 'Dull, rough or flaky skin.', watch: 'Can sting sensitive skin. Start slowly and wear sunscreen.' },
    { name: 'Petrolatum', what: 'An occlusive: it forms a seal that stops water escaping.', goodFor: 'Very dry, chapped spots.', watch: 'Heavy. Best on small areas or overnight.' },
    { name: 'Fragrance', what: 'Added scent, natural or synthetic.', goodFor: 'Nothing for dryness. It is there for smell.', watch: 'A common cause of irritation. Choose fragrance-free if you react easily.' },
    { name: 'Alcohol denat.', what: 'A drying alcohol used in some toners and gels.', goodFor: 'Not helpful for dry skin.', watch: 'Can make dryness worse. Avoid if your skin feels tight.' },
    { name: 'Sunscreen filters', what: 'Ingredients that protect skin from UV light.', goodFor: 'Everyone, every morning.', watch: 'Reapply when outdoors for a long time.' }
  ];

  const data = { QUESTIONS, PRODUCTS, INGREDIENTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else global.SkinviaData = data;
})(typeof window !== 'undefined' ? window : globalThis);

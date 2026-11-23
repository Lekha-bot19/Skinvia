# Skinvia v2 — find what works for dry skin

A small website that helps people with dry skin choose suitable skincare. You answer 7 quick questions and get **3 product types, each with a clear reason**, plus a simple morning and evening routine.

## Background

Skinvia started as a group project for MBUS673 Innovation at the University of Canterbury (2026), by Xeridan Coloma, Guarav Jangu, Lekha Gajanan Joshi, Rishabh Nangpal and Emily O'Connor. We interviewed people with dry skin and found the problem wasn't a lack of products. It was a lack of trustworthy information about which products suit them.

Testing the first prototype gave three clear pieces of feedback:

1. *"Too many results. Show me the three and why."*
2. The phrase "in plain English" sounded wrong.
3. The site looked AI-generated, so it felt less credible.

The report proposed a next version but never built it. **This repo is that next version**, rebuilt individually by Lekha Joshi in November 2026.

## What changed from the first prototype

| Feedback | What v2 does |
|---|---|
| Too many results | Exactly 3 picks, each from a different routine step |
| Show me why | Every pick lists the reasons it matches your answers |
| "In plain English" sounded wrong | A page called **Ingredients explained** |
| Looked AI-generated, less credible | A calm, plain design, and a **How we recommend** page that explains the logic and the safety rules |
| Eczema and cracked skin came up in interviews | Safety questions that show a "see a GP or pharmacist" message |
| Moisturiser wore off for cricket players during games | A quiz question about *when* dryness is worst, with on-the-go options |

## Pages

- **Home:** what Skinvia does, in 3 steps
- **Quiz:** 7 questions, one per screen, with a progress bar and a back button
- **My results:** 3 picks with reasons, ingredients to look for, where to buy, and a routine
- **Ingredients explained:** a searchable guide to common ingredients
- **My routine:** a daily checklist, saved in your browser
- **How we recommend:** how picks are chosen, the safety rules, and when to see a GP

## Design decisions

- **Product types, not brands.** For example, "ceramide moisturiser" instead of a named product. The research showed people distrust skincare claims, and the site can't verify every brand's formula. Recommending brands would need a dermatologist to check them first.
- **No reviews.** Without real users, reviews would be fake, which goes against the main research finding.
- **Rule-based logic.** Recommendations come from simple, explainable scoring rules, not a black box. Every pick shows its reasons.
- **Safety rules.** Everything suggested is fragrance-free. Sensitive skin never gets exfoliating acids. Cracked skin never gets anything that could sting.
- **Honest match score.** Each pick shows a match ring: how many of your answers it fits (for example 3 of 4 = 75%). No invented numbers.
- **Motion.** Products rise onto the plinth and float, water droplets drift up the background, light sweeps across the bottles, quiz questions slide in, finishing the quiz triggers a small burst, and results show filling match rings and growing fit bars (skin type, concerns, timing). All motion switches off for people who set "reduce motion" on their device.
- **User-friendly first.** Large text, one question per screen, a Next button so you stay in control of the pace, keyboard support, and a layout that works on a phone.

## How to run it

Open `index.html` in any browser. There's no install, and it works offline.

**Tests** (needs Node.js):

```
node recommend.test.js
```

15 tests cover the recommendation rules, including a check that **every possible combination of quiz answers** (over 500) returns 3 valid picks.

## Files

```
index.html          page layout
style.css           styling
data.js             quiz questions, product types and ingredients
recommend.js        the recommendation logic
app.js              pages and navigation
recommend.test.js   tests
PRD.md              product requirements
```

## How I built it

I wrote the requirements from our group research and testing feedback, then made the product decisions myself: product types over brands, no fake reviews, and the safety rules. I built the site with an AI assistant, reviewing each page in the browser and asking for changes.

## Limitations

- General information, not medical advice. Ingredient information is simplified.
- Product types haven't been reviewed by a dermatologist. That's the next step the research recommended.
- Answers and checklist progress are stored only in your own browser.

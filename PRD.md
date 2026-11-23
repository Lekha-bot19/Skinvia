# Skinvia v2 — Product Requirements

## Background
Skinvia started as a group project for MBUS673 Innovation (University of Canterbury, 2026). The team (Xeridan Coloma, Guarav Jangu, Lekha Gajanan Joshi, Rishabh Nangpal, Emily O'Connor) interviewed 10 people with dry skin and found that the problem is not a lack of products, but a lack of trustworthy information about which products suit them.

The first prototype was tested informally. Feedback:
- "Too many results. Show me the three and why."
- The phrase "in plain English" sounded wrong; use "Ingredients explained".
- The site looked AI-generated, which made it feel less credible.

The report proposed a next iteration (three recommendations, each with a reason) but did not build it. **Skinvia v2 is that iteration**, rebuilt individually by Lekha Joshi.

## Target user
Charlie, 26, a young working adult with dry skin who already has a routine but cannot tell which products suit them, and finds skincare shopping confusing.

## Goals
1. Help users find suitable products in under two minutes.
2. Show exactly three recommendations, each with a clear reason.
3. Build trust through transparency, not marketing.

## Requirements
- **User-friendly first:** one quiz question per screen, progress bar, back button, large readable text, plain wording, works on a phone, keyboard accessible.
- **Quiz:** 7 questions — how skin feels after washing, top concerns, sensitivity, when dryness is worst, number of steps, budget, and a safety check for serious symptoms.
- **Results:** exactly 3 picks with "why" reasons, a simple morning and evening routine, and where to find each product type.
- **Ingredient-led product types** (e.g. "ceramide moisturiser"), not brands, so the site makes no unverified claims about specific products.
- **Ingredients explained:** searchable list of what each ingredient does and who it suits.
- **My routine:** a daily checklist saved in the browser.
- **How we recommend:** transparency page explaining the logic, independence and when to see a GP or dermatologist.
- **Safety:** if the user reports cracking, bleeding, diagnosed eczema or a sudden severe reaction, results show a clear "see a GP or pharmacist" message.

## Out of scope (v2)
- User reviews (without real users they would be fake, which contradicts the research).
- Real brands, accounts, backend.

## Success checks
- Every quiz path returns 3 distinct picks with at least one reason each.
- Safety answers always trigger the GP message.
- Sensitive users never get fragrance or exfoliating acids.

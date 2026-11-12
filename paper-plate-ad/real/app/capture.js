// Captures REAL Paper Plate screens from the web app in the paper-plate repo (web/index.html), served on localhost:8765.
// Every outside request is blocked except Google Fonts, so the server is never called and nothing is billed.
// node capture.js <out-dir>
const { chromium } = require('playwright'); const path = require('path');
const recipe = { localID: 'ad-penne', savedAt: Date.now(), mealType: 'Dinner', heroMacro: 'calories',
  recipe_name: 'Weeknight Penne Pomodoro',
  description: 'Penne in a quick garlic and crushed-tomato sauce with dried basil. Everything comes off the shelf, and it is on the table in 25 minutes.',
  cuisine: 'Italian', prep_time: '5 minutes', cook_time: '20 minutes', servings: 4,
  ingredients_you_have: [{ amount: 12, unit: 'oz', item: 'penne' }, { amount: 2, unit: 'cans', item: 'crushed tomatoes (15 oz each)' },
    { amount: 4, unit: '', item: 'garlic cloves, sliced' }, { amount: 1, unit: 'tsp', item: 'dried basil' }],
  additional_ingredients_needed: [{ amount: 2, unit: 'tbsp', item: 'olive oil' }, { amount: 0.25, unit: 'cup', item: 'grated parmesan' }],
  sides: [],
  instructions: ['BOIL: Bring a large pot of water to a boil with 1 tbsp salt. Cook the penne 11 minutes, until just tender. Save 1 cup of the pasta water before you drain.',
    'START THE SAUCE: While the pasta cooks, warm the oil in a wide pan over medium heat. Add the garlic and cook 1 minute, until it smells sweet and is barely golden.',
    'SIMMER: Add the tomatoes, the basil and ½ tsp salt. Simmer 10 minutes, stirring now and then, until it thickens and coats a spoon.',
    'FINISH: Toss the drained penne in the sauce with a splash of pasta water for 1 minute. Serve with the parmesan.'],
  healthy_swaps: [{ original: 'penne', swap: 'whole-wheat penne', benefit: 'More fiber; cook 1 minute longer.' }],
  macros_per_serving: { calories: 430, protein_g: 15, fat_g: 10, carbs_g: 70, fiber_g: 6 },
  chef_tips: ['Pull the garlic off the heat the moment it turns pale gold: brown garlic turns the sauce bitter.'],
  image_search_query: 'penne pomodoro', photo: 'http://localhost:8765/__ad/penne.jpg' };
(async () => {
  const out = process.argv[2] || __dirname;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'light', serviceWorkers: 'block' });
  const p = await ctx.newPage();
  await p.clock.install({ time: new Date('2026-11-12T17:40:00') });
  await p.route('**/*', r => { const u = r.request().url();
    if (u.includes('/__ad/penne.jpg')) return r.fulfill({ path: path.join(__dirname, 'penne.jpg'), contentType: 'image/jpeg' });
    if (u.startsWith('http://localhost:8765') || u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com')) return r.continue();
    return r.abort(); });
  await p.addInitScript(r => { localStorage.setItem('pp_sample_seeded', 'true'); localStorage.setItem('pp_recipes_v2', JSON.stringify([r])); }, recipe);
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(out, 'app-create.png') });
  await p.getByText('Book', { exact: true }).last().click(); await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(out, 'app-book.png') });
  await p.getByText('Weeknight Penne Pomodoro').first().click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(out, 'app-recipe.png') });
  await p.screenshot({ path: path.join(out, 'app-recipe-full.png'), fullPage: true });
  console.log((await p.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\n+/g, ' | '));
  await b.close();
})();

import {test,expect} from '@playwright/test';

const lesson='/english/animal-farm/chapter-3.html';
test.beforeEach(async ({page})=>{
  await page.goto(lesson);
  await page.evaluate(()=>localStorage.removeItem('lwh:animal-farm:chapter-3:v1'));
  await page.reload();
});

test('subject catalog has English and World History without replacing existing history',async ({page})=>{
  await page.goto('/learn.html');
  await expect(page.getByRole('heading',{name:'English'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'World History'})).toBeVisible();
  await expect(page.getByRole('link',{name:/Chapter 3 — Life on the Farm/})).toHaveAttribute('href','./english/animal-farm/chapter-3.html');
  await expect(page.getByRole('link',{name:/Open World History/})).toHaveAttribute('href','./learn_with_h_v27_4.html');
});

test('character navigation saves position and resume returns to it',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  await expect(page.getByRole('heading',{name:'Snowball'})).toBeVisible();
  await page.getByRole('button',{name:/Next/}).click();
  await expect(page.getByRole('heading',{name:'Napoleon'})).toBeVisible();
  await page.getByRole('button',{name:/Lesson Menu/}).first().click();
  await page.reload();
  await page.getByRole('button',{name:/Resume Where I Left Off/}).click();
  await expect(page.getByRole('heading',{name:'Napoleon'})).toBeVisible();
});

test('character reference returns to the same reading section',async ({page})=>{
  await page.getByRole('button',{name:/2. Read Chapter 3/}).click();
  await page.getByRole('button',{name:/Next/}).click();
  await expect(page.getByText('Reading Section 2 of 10')).toBeVisible();
  await page.getByRole('button',{name:/Characters/}).click();
  await expect(page.getByRole('dialog',{name:'Character Reference'})).toBeVisible();
  await page.getByRole('dialog').getByRole('button',{name:/Snowball/}).click();
  await page.getByRole('button',{name:/Back to Reading/}).click();
  await expect(page.getByText('Reading Section 2 of 10')).toBeVisible();
});

test('incorrect matching colors both cards, correct match remains green',async ({page})=>{
  await page.getByRole('button',{name:/4. Vocabulary Matching/}).click();
  const words=page.locator('[data-action="match-word"]');
  const meanings=page.locator('[data-action="match-meaning"]');
  await words.nth(0).click();
  await meanings.nth(0).click(); // wrong: definition 2, not word 0
  await expect(words.nth(0)).toHaveClass(/bad/);
  await expect(meanings.nth(0)).toHaveClass(/bad/);
  await expect(page.getByText('Not quite. Try again!')).toBeVisible();
  await words.nth(0).click();
  await meanings.nth(1).click(); // note DOM order is shuffled [2,0,1] so this is the correct definition for word 0
  await expect(words.nth(0)).toHaveClass(/matched/);
});

test('skip is tracked, then disappears after correct answer on retry',async ({page})=>{
  await page.getByRole('button',{name:/5. Fill in the Blank/}).click();
  await page.getByRole('button',{name:/Skip/}).click();
  await page.getByRole('button',{name:/Lesson Menu/}).first().click();
  await page.getByRole('button',{name:/8. Review My Learning/}).click();
  await page.getByRole('button',{name:'Try Again'}).click();
  await page.getByRole('button',{name:/Go to Item/}).first().click();
  await page.locator('[data-action="answer"]').filter({hasText:'toiled'}).click();
  await page.getByRole('button',{name:/Lesson Menu/}).first().click();
  await page.getByRole('button',{name:/8. Review My Learning/}).click();
  await page.getByRole('button',{name:'Try Again'}).click();
  await expect(page.getByText('No skipped items to revisit right now!')).toBeVisible();
});

test('writing autosaves through a reload, and Start Again archives earlier answer',async ({page})=>{
  await page.getByRole('button',{name:/6. Make Your Own Sentence/}).click();
  const textarea=page.locator('textarea[data-field="draft"]');
  await textarea.fill('The animals toiled in the fields.');
  await page.reload();
  await page.getByRole('button',{name:/Resume Where I Left Off/}).click();
  await expect(page.locator('textarea[data-field="draft"]')).toHaveValue('The animals toiled in the fields.');
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:/Start Again/}).click();
  await expect(page.locator('textarea[data-field="draft"]')).toHaveValue('');
  await page.getByRole('button',{name:/Parent Mode/}).click();
  await expect(page.getByText('Previous Attempts')).toBeVisible();
});

test('guided comprehension answer may complete without typed writing',async ({page})=>{
  await page.getByRole('button',{name:/7. Reading Comprehension/}).click();
  await page.locator('[data-action="answer"]').filter({hasText:'Teaching animals to read and write'}).click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('lwh:animal-farm:chapter-3:v1')));
  expect(stored.activities[6].done['0']).toBe(true);
  expect(stored.activities[6].drafts['0']).toBeUndefined();
});


test('World History Start Matching opens its matching activity',async ({page})=>{
  await page.goto('/learn_with_h_v27_4.html');
  await page.getByRole('button',{name:/Explore World History/}).click();
  await page.getByRole('button',{name:/Explore Topic/}).click();
  await page.getByRole('button',{name:/Start Lesson/}).first().click();
  await page.getByRole('button',{name:/Explore Visual Story/}).click();
  await page.getByRole('button',{name:/Learn Vocabulary/}).click();
  await page.getByRole('button',{name:/Start Matching/}).click();
  await expect(page.getByRole('heading',{name:/Match each clue to a word/})).toBeVisible();
});


test('Parent Mode narration speed and voice settings are available',async ({page})=>{
  await page.getByRole('button',{name:/Parent Mode/}).click();
  await expect(page.locator('[data-field="voice"]')).toBeVisible();
  await page.locator('[data-field="rate"]').selectOption('1');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lwh:animal-farm:chapter-3:v1')));
  expect(saved.rate).toBe(1);
  await page.reload();
  await page.getByRole('button',{name:/Parent Mode/}).click();
  await expect(page.locator('[data-field="rate"]')).toHaveValue('1');
});

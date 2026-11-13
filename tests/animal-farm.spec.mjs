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


test('all six approved portraits render in View All Characters',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  const first=page.locator('.portrait-feature img');
  await expect(first).toHaveAttribute('src',/snowball\.webp$/);
  await expect.poll(()=>first.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  await page.getByRole('button',{name:/View All Characters/}).click();
  const portraits=page.locator('.charactergrid .portrait-box img');
  await expect(portraits).toHaveCount(6);
  const paths=['snowball.webp','napoleon.webp','squealer.webp','boxer.webp','benjamin.webp','mr_jones.webp'];
  for(let i=0;i<paths.length;i++){
    await expect(portraits.nth(i)).toHaveAttribute('src',new RegExp(paths[i].replace('.','\\.')+'$'));
    await expect.poll(()=>portraits.nth(i).evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  }
  await page.getByRole('button',{name:/One at a Time/}).click();
  await expect(page.locator('.portrait-feature img')).toHaveAttribute('src',/snowball\.webp$/);
});
test('character reference portrait displays and returns to reading position',async ({page})=>{
  await page.getByRole('button',{name:/2. Read Chapter 3/}).click();
  await page.getByRole('button',{name:/Next/}).click();
  await page.getByRole('button',{name:/Characters/}).click();
  const modal=page.getByRole('dialog',{name:'Character Reference'});
  await modal.getByRole('button',{name:/Snowball/}).click();
  const portrait=modal.locator('.portrait-feature img');
  await expect(portrait).toHaveAttribute('src',/snowball\.webp$/);
  await expect.poll(()=>portrait.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  await modal.getByRole('button',{name:/Back to Reading/}).click();
  await expect(page.getByText('Reading Section 2 of 10')).toBeVisible();
});


test('vocabulary uses all ten approved words and source-context panels',async ({page})=>{
  await page.getByRole('button',{name:/3. Learn the Vocabulary/}).click();
  const expected=['toiled','supervised','superior','obstinate','cryptic','indefatigable','literate','seclusion','resolutions','maxim'];
  for(let i=0;i<expected.length;i++){
    await expect(page.getByRole('heading',{name:expected[i],exact:true})).toBeVisible();
    await page.locator('#story-detail summary').click();
    await expect(page.getByText('From the teacher’s Chapter 3 vocabulary worksheet')).toBeVisible();
    if(i<expected.length-1)await page.getByRole('button',{name:/Next/}).click();
  }
});
test('matching has three words in first three rounds and one in fourth',async ({page})=>{
  await page.getByRole('button',{name:/4. Vocabulary Matching/}).click();
  for(let round=0;round<4;round++){
    const count=round===3?1:3;
    await expect(page.locator('[data-action="match-word"]')).toHaveCount(count);
    for(let i=0;i<count;i++){
      await page.locator('[data-action="match-word"]').nth(i).click();
      const meaningOrder=[[2,0,1],[1,2,0],[2,0,1],[0]][round];
      await page.locator('[data-action="match-meaning"]').nth(meaningOrder.indexOf(i)).click();
    }
    if(round<3)await page.getByRole('button',{name:/Continue/}).click();
  }
  await page.getByRole('button',{name:/Finish \/ Review/}).click();
  await page.getByRole('button',{name:/Lesson Menu/}).first().click();
  await expect(page.getByRole('button',{name:/4. Vocabulary Matching/})).toContainText('Completed');
});
test('all ten reading sections have a quick check and preserve answered location',async ({page})=>{
  await page.getByRole('button',{name:/2. Read Chapter 3/}).click();
  const expected=[
    'The Animals Work Together','Boxer Works the Hardest','The Pigs Become Leaders',
    'Snowball Starts Committees','Learning to Read and Write','The Animals Learn a Short Rule',
    'Snowball and Napoleon Disagree','Napoleon Takes the Puppies','The Missing Milk and Apples',
    'Squealer Tries to Convince Everyone'
  ];
  for(let i=0;i<expected.length;i++){
    await expect(page.getByRole('heading',{name:new RegExp(expected[i])})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Quick Check'})).toBeVisible();
    if(i<expected.length-1)await page.getByRole('button',{name:/Next/}).click();
  }
});

test('clicking the selected word again deselects without losing completed pairs',async ({page})=>{
  await page.getByRole('button',{name:/4. Vocabulary Matching/}).click();
  const word=page.locator('[data-action="match-word"]').first();
  await word.click();
  await expect(word).toHaveClass(/selected/);
  await word.click();
  await expect(word).not.toHaveClass(/selected/);
  await expect(page.getByText('Word unselected. Choose a word when you are ready.')).toBeVisible();
  await word.click();
  await page.locator('[data-action="match-meaning"]').nth(1).click();
  await expect(word).toHaveClass(/matched/);
});

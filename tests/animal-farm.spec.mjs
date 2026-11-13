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
  await meanings.nth(1).click(); // switch directly to the correct meaning; word stays selected
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
  await page.getByRole('link',{name:/Parent Mode/}).click();
  await page.locator('details summary').click();
  await expect(page.getByRole('heading',{name:'Previous Attempts'})).toBeVisible();
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


test('global Parent Mode narration settings are accessible and saved',async ({page})=>{
  await page.getByRole('link',{name:/Parent Mode/}).click();
  await expect(page).toHaveURL(/\/parent\.html$/);
  await expect(page.getByRole('heading',{name:'Parent Mode'})).toBeVisible();
  await expect(page.locator('#global-voice')).toBeVisible();
  await page.locator('#global-rate').selectOption('1');
  const settings=await page.evaluate(()=>JSON.parse(localStorage.getItem('lwh:parent:settings:v1')));
  expect(settings.rate).toBe(1);
  await page.reload();
  await expect(page.locator('#global-rate')).toHaveValue('1');
});


test('all twelve approved portraits render in View All Characters',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  const first=page.locator('.portrait-feature img');
  await expect(first).toHaveAttribute('src',/snowball\.webp$/);
  await expect.poll(()=>first.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
  await page.getByRole('button',{name:/View All Characters/}).click();
  const portraits=page.locator('.charactergrid .portrait-box img');
  await expect(portraits).toHaveCount(12);
  await expect(page.getByRole('heading',{name:'Main Characters'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Supporting Characters'})).toBeVisible();
  await expect(page.locator('.charactergrid [data-action="character"]')).toHaveCount(12);
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
    await expect(page.locator('.vocab-context')).toBeVisible();
    await expect(page.locator('.vocab-context strong')).toHaveText(expected[i]);
    await expect(page.getByText('Simplified retelling based on Chapter 3, not a direct quotation.')).toBeVisible();
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
  await expect(page.getByText('Word unselected. Choose a word or meaning.')).toBeVisible();
  await word.click();
  await page.locator('[data-action="match-meaning"]').nth(1).click();
  await expect(word).toHaveClass(/matched/);
});

test('Use Starter inserts sentence opening without ellipsis and focuses writing',async ({page})=>{
  await page.getByRole('button',{name:/6. Make Your Own Sentence/}).click();
  await page.getByRole('button',{name:/Sentence Starter/}).click();
  await page.getByRole('button',{name:/Use Starter/}).click();
  const draft=page.locator('textarea[data-field="draft"]');
  await expect(draft).toHaveValue('The animals toiled when ');
  await expect(draft).toBeFocused();
  await draft.press('End');
  await draft.type('they gathered hay.');
  await expect(draft).toHaveValue('The animals toiled when they gathered hay.');
});

test('comprehension feedback colors reflect correctness and writing aids follow answer',async ({page})=>{
  await page.getByRole('button',{name:/7. Reading Comprehension/}).click();
  const writing=page.locator('textarea[data-field="draft"]');
  const hint=page.getByRole('button',{name:/Hint/});
  const starter=page.getByRole('button',{name:/Sentence Starter/});
  await expect.poll(async()=>writing.evaluate(el=>el.compareDocumentPosition(document.querySelector('[data-action="hint"]')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await expect.poll(async()=>writing.evaluate(el=>el.compareDocumentPosition(document.querySelector('[data-action="starter"]')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await page.locator('[data-action="answer"]').filter({hasText:'Teaching hens to fly'}).click();
  const feedback=page.locator('details .feedback');
  await expect(feedback).toHaveClass(/bad/);
  await expect(feedback).toHaveCSS('color','rgb(135, 62, 58)');
  await expect(feedback).toHaveText('Not quite. Try another answer!');
  await page.locator('[data-action="answer"]').filter({hasText:'Teaching animals to read and write'}).click();
  await expect(feedback).toHaveClass(/good/);
  await expect(feedback).toHaveCSS('color','rgb(39, 105, 71)');
  await expect(feedback).toHaveText('Correct! You understood the story.');
});

test('supporting animal references are accessible and gallery progress includes twelve entries',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  await page.getByRole('button',{name:/View All Characters/}).click();
  const supporting=page.getByRole('heading',{name:'Supporting Characters'});
  await expect(supporting).toBeVisible();
  await expect(page.getByRole('heading',{name:'Clover'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Mollie'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Muriel'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Jessie'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Bluebell'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'The Nine Puppies'})).toBeVisible();
  await page.locator('.charactergrid [data-character="11"]').click();
  await expect(page.getByRole('heading',{name:'The Nine Puppies'})).toBeVisible();
  await expect(page.getByText(/loft and keeps them apart/)).toBeVisible();
  await page.getByRole('button',{name:/Lesson Menu/}).first().click();
  await page.getByRole('button',{name:/8. Review My Learning/}).click();
  await expect(page.getByText('0 of 12 completed')).toBeVisible();
});
test('Continue Learning goes to a selected next unfinished item',async ({page})=>{
  await page.getByRole('button',{name:/5. Fill in the Blank/}).click();
  await page.getByRole('button',{name:/Skip/}).click();
  await page.getByRole('button',{name:/Lesson Menu/}).first().click();
  await page.getByRole('button',{name:/8. Review My Learning/}).click();
  await expect(page.getByRole('button',{name:/Continue Learning/})).toBeVisible();
  await page.getByRole('button',{name:/Continue Learning/}).click();
  await expect(page.getByText('Question 2 of 10')).toBeVisible();
});

test('all ten approved reading illustrations load and hide placeholder',async ({page})=>{
  await page.getByRole('button',{name:/2. Read Chapter 3/}).click();
  for(let i=1;i<=10;i++){
    const image=page.locator('.scene-image');
    const filename='scene-'+String(i).padStart(2,'0')+'.webp';
    await expect.poll(()=>image.getAttribute('src')).toContain(filename);
    await expect.poll(()=>image.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
    await expect(image).toBeVisible();
    await expect(page.locator('.scene-placeholder')).toBeHidden();
    if(i<10)await page.getByRole('button',{name:/Next/}).click();
  }
});

test('Clover Mollie and Muriel portraits load as actual images',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  await page.getByRole('button',{name:/View All Characters/}).click();
  for(const filename of ['clover.webp','mollie.webp','muriel.webp']){
    const portrait=page.locator('.charactergrid img[src$="'+filename+'"]');
    await expect(portrait).toHaveCount(1);
    await expect.poll(()=>portrait.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  }
});

test('supporting portraits are wired to their individual assets with fallback while awaiting upload',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  await page.getByRole('button',{name:/View All Characters/}).click();
  for(const filename of ['jessie.webp','bluebell.webp','puppies.webp']){
    const portrait=page.locator('.charactergrid img[src$="'+filename+'"]');
    await expect(portrait).toHaveCount(1);
    await expect(portrait).toHaveAttribute('alt',/portrait/);
  }
});

test('Animal Farm lesson menu follows World History visual layout',async ({page})=>{
  await expect(page.locator('header')).toHaveCSS('background-color','rgb(37, 77, 133)');
  await expect(page.locator('.lesson-hero')).toBeVisible();
  await expect(page.getByRole('heading',{name:'Animal Farm — Chapter 3'})).toBeVisible();
  await expect(page.locator('.lesson-subtitle')).toHaveText('Life on the Farm');
  await expect(page.locator('.activity-tile')).toHaveCount(8);
  await expect(page.locator('.activity-icon')).toHaveCount(8);
  await expect(page.getByRole('button',{name:/Listen/})).toBeVisible();
  await page.locator('.activity-tile').first().click();
  await expect(page.getByRole('heading',{name:'Snowball'})).toBeVisible();
});

test('approved illustration never flashes the emoji placeholder while loading',async ({page})=>{
  await page.route('**/assets/scenes/scene-01.webp',async route=>{
    await new Promise(resolve=>setTimeout(resolve,700));
    await route.continue();
  });
  await page.getByRole('button',{name:/2. Read Chapter 3/}).click();
  await expect(page.locator('.scene-placeholder')).toBeHidden();
  await expect.poll(()=>page.locator('.scene-image').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.locator('.scene-placeholder')).toBeHidden();
});
test('illustration fallback appears only if the image fails',async ({page})=>{
  await page.route('**/assets/scenes/scene-01.webp',route=>route.abort());
  await page.getByRole('button',{name:/2. Read Chapter 3/}).click();
  await expect(page.locator('.scene-placeholder')).toBeVisible();
  await expect(page.getByText(/Illustration unavailable/)).toBeVisible();
});

test('vocabulary focuses on the word without an unavailable illustration message',async ({page})=>{
  await page.getByRole('button',{name:/3. Learn the Vocabulary/}).click();
  await expect(page.locator('.vocab-focus .vocab-term')).toHaveText('toiled');
  await expect(page.getByText('Worked very hard.')).toBeVisible();
  await expect(page.getByText('Illustration unavailable')).toHaveCount(0);
  await expect(page.locator('.vocab-focus')).toBeVisible();
  await page.getByRole('button',{name:/Next/}).click();
  await expect(page.locator('.vocab-focus .vocab-term')).toHaveText('supervised');
});

test('matching permits choosing a new meaning or a new word without restarting',async ({page})=>{
  await page.getByRole('button',{name:/4. Vocabulary Matching/}).click();
  const words=page.locator('[data-action="match-word"]');
  const meanings=page.locator('[data-action="match-meaning"]');
  await words.nth(0).click();
  await meanings.nth(0).click(); // wrong: meaning of superior
  await expect(words.nth(0)).toHaveClass(/bad/);
  await expect(meanings.nth(0)).toHaveClass(/bad/);
  await meanings.nth(1).click(); // correct for toiled, without reselecting word
  await expect(words.nth(0)).toHaveClass(/matched/);
  await expect(meanings.nth(1)).toHaveClass(/matched/);
  await meanings.nth(2).click(); // meaning of supervised: choose meaning first
  await expect(meanings.nth(2)).toHaveClass(/selected/);
  await words.nth(2).click(); // wrong word, still selected after incorrect feedback
  await expect(words.nth(2)).toHaveClass(/bad/);
  await words.nth(1).click(); // switch word to supervised
  await expect(words.nth(1)).toHaveClass(/matched/);
  await expect(meanings.nth(2)).toHaveClass(/matched/);
});

test('fill in the blank shows relevant approved story artwork and preserves question',async ({page})=>{
  await page.getByRole('button',{name:/5. Fill in the Blank/}).click();
  await expect(page.locator('.fill-illustration img')).toHaveAttribute('src',/scene-01\.webp$/);
  await expect.poll(()=>page.locator('.fill-illustration img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(page.getByText('The animals ____ in the fields to bring in the hay.')).toBeVisible();
  await expect(page.getByText('Illustration unavailable')).toHaveCount(0);
  await page.getByRole('button',{name:/Next/}).click();
  await expect(page.locator('.fill-illustration img')).toHaveAttribute('src',/scene-03\.webp$/);
});

test('changing the vocabulary word clears previous starter and saved sentence',async ({page})=>{
  await page.getByRole('button',{name:/6. Make Your Own Sentence/}).click();
  await page.getByRole('button',{name:/Sentence Starter/}).click();
  await page.getByRole('button',{name:/Use Starter/}).click();
  const draft=page.locator('textarea[data-field="draft"]');
  await expect(draft).toHaveValue('The animals toiled when ');
  await page.locator('select[data-field="word"]').selectOption('supervised');
  await expect(page.locator('textarea[data-field="draft"]')).toHaveValue('');
  await expect(page.getByText('The animals toiled when...')).toHaveCount(0);
  await page.getByRole('button',{name:/Sentence Starter/}).click();
  await expect(page.getByText('The teacher supervised...')).toBeVisible();
});

test('each vocabulary word displays a real approved illustration rather than emoji',async ({page})=>{
  await page.getByRole('button',{name:/3. Learn the Vocabulary/}).click();
  const sceneNumbers=[2,3,3,5,5,4,5,8,7,6];
  for(let i=0;i<10;i++){
    const picture=page.locator('.vocab-art img');
    await expect(picture).toHaveAttribute('src',new RegExp('scene-'+String(sceneNumbers[i]).padStart(2,'0')+'\\.webp$'));
    await expect.poll(()=>picture.evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
    await expect(page.locator('.vocab-icon')).toHaveCount(0);
    if(i<9)await page.getByRole('button',{name:/Next/}).click();
  }
});

test('story context is expanded and checked vocabulary feedback uses green and red',async ({page})=>{
  await page.getByRole('button',{name:/3. Learn the Vocabulary/}).click();
  await page.locator('#story-detail summary').click();
  const paragraph=page.locator('.vocab-context');
  await expect(paragraph).toContainText('They toiled in the fields');
  await expect(paragraph.locator('strong')).toHaveText('toiled');
  await expect(page.getByRole('button',{name:/Listen to Story Context/})).toBeVisible();
  await page.getByRole('button',{name:/Check My Understanding/}).click();
  await page.locator('[data-action="check-word"]').nth(1).click();
  const message=page.locator('.vocab-check-feedback');
  await expect(message).toHaveText('Not quite. Try again!');
  await expect(message).toHaveCSS('color','rgb(164, 62, 59)');
  await page.locator('[data-action="check-word"]').nth(0).click();
  await expect(message).toHaveText('That’s right!');
  await expect(message).toHaveCSS('color','rgb(35, 115, 71)');
});

test('vocabulary question visibly highlights the selected answer and allows retries',async ({page})=>{
  await page.getByRole('button',{name:/3. Learn the Vocabulary/}).click();
  await page.locator('#story-detail summary').click();
  await page.getByRole('button',{name:/Check My Understanding/}).click();
  const choices=page.locator('[data-action="check-word"]');
  await expect(choices).toHaveCount(3);
  await choices.nth(1).click();
  await expect(choices.nth(1)).toHaveClass(/bad/);
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed','true');
  await expect(choices.nth(0)).not.toHaveClass(/good/);
  await expect(page.locator('.vocab-check-feedback')).toHaveClass(/bad/);
  await choices.nth(0).click();
  await expect(choices.nth(0)).toHaveClass(/good/);
  await expect(choices.nth(0)).toHaveAttribute('aria-pressed','true');
  await expect(choices.nth(1)).not.toHaveClass(/bad/);
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed','false');
  await expect(page.locator('.vocab-check-feedback')).toHaveClass(/good/);
  await page.getByRole('button',{name:/Next/}).click();
  await page.locator('#story-detail summary').click();
  await page.getByRole('button',{name:/Check My Understanding/}).click();
  await expect(page.locator('[data-action="check-word"].good')).toHaveCount(0);
  await expect(page.locator('[data-action="check-word"].bad')).toHaveCount(0);
});

test('Parent Mode is global across the learning library and shows the Animal Farm drilldown',async ({page})=>{
  await page.getByRole('button',{name:/1. Meet the Characters/}).click();
  await page.getByRole('button',{name:/Next/}).click();
  await page.getByRole('link',{name:/Parent Mode/}).click();
  await expect(page.getByRole('heading',{name:'Parent Mode',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Subjects & Lessons'})).toBeVisible();
  await expect(page.getByRole('heading',{name:/Animal Farm — Chapter 3/})).toBeVisible();
  await expect(page.getByRole('heading',{name:/World History/})).toBeVisible();
  await page.locator('details summary').click();
  await expect(page.getByText('Meet the Characters')).toBeVisible();
  await expect(page.getByText('1 of 12 completed')).toBeVisible();
  await page.getByRole('link',{name:/Subjects/}).click();
  await expect(page).toHaveURL(/\/learn\.html$/);
  await expect(page.getByRole('link',{name:/Parent Mode/})).toBeVisible();
});

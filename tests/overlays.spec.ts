import { test, expect, type Locator } from '@playwright/test';

// Seek through the opening animation so even a one-frame corner flash is caught.
async function expectStableOpening(panel: Locator) {
  await expect(panel).toBeVisible();
  const positions = await panel.evaluate(async element => {
    const animation = element.getAnimations()[0];
    if (!animation) throw new Error('Expected an opening animation');
    animation.pause();
    const duration = Number(animation.effect!.getTiming().duration);
    const positions = [];
    for (const fraction of [0.1, 0.5, 0.9, 1]) {
      animation.currentTime = duration * fraction;
      await new Promise(requestAnimationFrame);
      const rect = element.getBoundingClientRect();
      positions.push({ x: rect.x, y: rect.y });
    }
    animation.finish();
    return positions;
  });
  const final = positions.at(-1)!;
  expect(final.x).toBeGreaterThan(8);
  expect(final.y).toBeGreaterThan(8);
  for (const position of positions) {
    expect(Math.abs(position.x - final.x)).toBeLessThan(1);
    expect(Math.abs(position.y - final.y)).toBeLessThan(1);
  }
}

test('options panels stay at their buttons while opening and remain usable', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: ':root { --dur-fast: 2s; }' });
  const lab = page.getByRole('button', { name: 'UX Lab', exact: true });
  await lab.click();
  const dialog = page.getByRole('dialog', { name: 'UX Lab' });
  await expectStableOpening(dialog);
  await expect(dialog.getByRole('radio', { name: 'A · Legacy modal' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(lab).toBeFocused();

  const region = page.getByRole('button', { name: 'Region: All', exact: true });
  await region.click();
  const list = page.getByRole('listbox', { name: 'Region' });
  await expectStableOpening(list);
  await expect(list.getByRole('option').first()).toBeFocused();
  await list.getByRole('option').first().click();
  await expect(list.getByRole('option').first()).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('heading', { name: 'Revenue overview', exact: true }).click();
  await expect(list).toHaveCount(0);

  const options = page.getByRole('button', { name: 'Widget options', exact: true }).first();
  for (let i = 0; i < 2; i++) {
    await options.click();
    const menu = page.getByRole('menu');
    await expectStableOpening(menu);
    await expect(menu.getByRole('menuitemcheckbox').first()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(menu.locator('[role^="menuitem"]:not([aria-disabled="true"])').nth(1)).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(options).toBeFocused();
  }
});

test('tooltips stay beside their buttons throughout the opening animation', async ({ page }) => {
  await page.goto('/');
  await page.addStyleTag({ content: ':root { --dur-fast: 2s; }' });
  const button = page.getByRole('button', { name: 'Account alerts', exact: true });
  await button.hover();
  await expectStableOpening(page.getByRole('tooltip', { name: 'Account alerts' }));
  await page.mouse.move(700, 100);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('mobile filter popup stays anchored while opening', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.addStyleTag({ content: ':root { --dur-fast: 2s; }' });
  const region = page.getByRole('button', { name: 'Region: All', exact: true });
  await region.click();
  const list = page.getByRole('listbox', { name: 'Region' });
  await expectStableOpening(list);
  const rect = await list.boundingBox();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape');
  await expect(region).toBeFocused();
});

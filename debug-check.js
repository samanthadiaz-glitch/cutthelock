const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.connectOverCDP('wss://connect.anchorbrowser.io/?sessionId=617288d9-69a5-4d3f-bc74-5289a62ca254');
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  await page.goto('https://refound-j4ig.polsia.app/admin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const title = await page.title();
  const loginError = await page.evaluate(() => {
    const el = document.getElementById('login-error');
    return el ? { text: el.textContent, display: el.style.display } : null;
  });
  const btnExists = await page.evaluate(() => {
    return document.getElementById('btn-new-recovery-item') !== null;
  });
  const riModalExists = await page.evaluate(() => {
    return document.getElementById('ri-modal') !== null;
  });
  const adminScriptRan = await page.evaluate(() => {
    return typeof window.recalcInvoiceTotals === 'function';
  });

  console.log('Title:', title);
  console.log('Login error:', JSON.stringify(loginError));
  console.log('btn-new-recovery-item exists:', btnExists);
  console.log('ri-modal exists:', riModalExists);
  console.log('window.recalcInvoiceTotals defined:', adminScriptRan);
  console.log('Console errors:', JSON.stringify(errors));

  await browser.close();
})().catch(e => console.error('Error:', e.message));
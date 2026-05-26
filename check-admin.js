// Extract the admin page template literal from server.js and check for problems
const fs = require('fs');
const src = fs.readFileSync('server.js', 'utf8');

// Find the admin route
const adminStart = src.indexOf("app.get('/admin'");
const sendIdx = src.indexOf('.send(`', adminStart);
const tplStart = sendIdx + 6;

let tplEnd = -1;
for (let i = tplStart + 1; i < src.length; i++) {
  if (src[i] === '\\') { i++; continue; }
  if (src[i] === '`') { tplEnd = i; break; }
}

const html = src.substring(tplStart + 1, tplEnd);

// Check 1: Are there \u escape sequences in the template that won't be processed?
// In a template literal, \u2026 becomes the actual Unicode char.
// But if it's inside a JS string that's inside the template literal,
// the \u2026 gets processed by the template literal FIRST.
console.log('=== CHECK 1: Raw \\u escape sequences ===');
const uEscapes = [];
const uRe = /\\u[0-9a-fA-F]{4}/g;
let uM;
while ((uM = uRe.exec(html)) !== null) {
  const lineNum = html.substring(0, uM.index).split('\n').length;
  const ctx = html.substring(Math.max(0, uM.index - 30), uM.index + 30);
  uEscapes.push({ line: lineNum, escape: uM[0], context: ctx.replace(/\n/g, '\\n') });
}
console.log('Found', uEscapes.length, 'raw \\u escapes in template');
uEscapes.forEach(u => console.log('  Line', u.line, ':', u.escape, '- near:', JSON.stringify(u.context)));

// Check 2: Backtick characters inside the template (should be zero)
console.log('\n=== CHECK 2: Backticks inside template ===');
let backtickCount = 0;
for (let i = 0; i < html.length; i++) {
  if (html[i] === '`') {
    backtickCount++;
    const lineNum = html.substring(0, i).split('\n').length;
    const ctx = html.substring(Math.max(0, i - 30), i + 30);
    console.log('  BACKTICK at line', lineNum, ':', JSON.stringify(ctx));
  }
}
console.log('Total backticks in template body:', backtickCount);

// Check 3: Look for ${} interpolation (should be zero in admin template)
console.log('\n=== CHECK 3: Template interpolations ===');
const interpRe = /\$\{/g;
let interpM;
let interpCount = 0;
while ((interpM = interpRe.exec(html)) !== null) {
  interpCount++;
  const lineNum = html.substring(0, interpM.index).split('\n').length;
  const ctx = html.substring(Math.max(0, interpM.index - 20), interpM.index + 40);
  console.log('  INTERPOLATION at line', lineNum, ':', JSON.stringify(ctx));
}
console.log('Total interpolations:', interpCount);

// Check 4: The rendered output - what does the template literal ACTUALLY produce?
// Since we can't run the server, simulate it by evaluating the template literal
console.log('\n=== CHECK 4: Script block validation in RENDERED output ===');
// The template literal in server.js has no interpolations, so the raw text IS the output
const re = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m, idx = 0;
while ((m = re.exec(html)) !== null) {
  idx++;
  const content = m[1];
  // Check for escape sequences that might be double-processed
  // In the source: \u2026 inside a template literal becomes the actual char …
  // So in the rendered HTML, there should be NO literal \u2026 sequences
  const rawEscapes = content.match(/\\u[0-9a-fA-F]{4}/g);
  if (rawEscapes) {
    console.log('  Script', idx, 'has RAW \\u escapes in rendered output:', rawEscapes);
    console.log('  This is WRONG - template literal should have converted these');
  }
  // The JS engine will see \\u2026 as a literal backslash + u2026, NOT as a Unicode escape
  // This would cause "Invalid or unexpected token"!
}

// Check 5: Look for the actual issue - \u sequences get consumed by template literal
// When server.js has: btn.textContent = 'Signing in\u2026';
// The template literal processes \u2026 into … (the actual ellipsis character)
// So the browser receives: btn.textContent = 'Signing in…';
// That's fine! The browser will parse … as a valid char in a string.

// BUT if there's a literal backslash followed by something unexpected...
console.log('\n=== CHECK 5: Literal backslashes in rendered JS ===');
const re2 = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m2, idx2 = 0;
while ((m2 = re2.exec(html)) !== null) {
  idx2++;
  const content = m2[1];
  // After template literal processing, are there any stray backslashes?
  const bsRe = /\\/g;
  let bsM;
  let bsCount = 0;
  while ((bsM = bsRe.exec(content)) !== null) {
    bsCount++;
    if (bsCount <= 10) {
      const nextChar = content[bsM.index + 1] || 'EOF';
      const ctx = content.substring(Math.max(0, bsM.index - 20), bsM.index + 20).replace(/\n/g, '\\n');
      console.log('  Script', idx2, '- backslash at', bsM.index, ', next char:', JSON.stringify(nextChar), ', context:', JSON.stringify(ctx));
    }
  }
  console.log('  Script', idx2, 'total backslashes:', bsCount);
}

console.log('\n=== CHECK 6: Checking what \\u2026 becomes after template literal processing ===');
// In Node.js, when we read the file as a string, we see the raw source
// The template literal in server.js: `...btn.textContent = 'Signing in\u2026';...`
// When Node evaluates the template literal, \u2026 becomes the character …
// So the HTML sent to browser has: btn.textContent = 'Signing in…';
// That's valid JS.

// But let me check if there are OTHER escape sequences that might be problematic
const scriptBlocks = [];
const re3 = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let m3;
while ((m3 = re3.exec(html)) !== null) {
  scriptBlocks.push(m3[1]);
}

// Now check what the ACTUAL rendered content would be
// Since template literals process escapes, the content we extracted IS what the browser gets
// (because our file read gives us the raw source, and the regex matched the literal text)
// Wait - no. We read the SOURCE FILE, not the RENDERED OUTPUT.
// In the source file, \u2026 is literal characters: backslash, u, 2, 0, 2, 6
// When Node.js evaluates the template literal, those 6 characters become 1 character: …
// Our regex matched the SOURCE text, so we're looking at pre-processing content.

// Let me check what happens if we eval the template literal
console.log('Evaluating template literal to get ACTUAL browser-received HTML...');
try {
  // We need to eval the template literal portion of the source
  const evalResult = eval('`' + html + '`');
  console.log('Eval successful. Rendered length:', evalResult.length, '(source was', html.length, ')');

  // Now check script blocks in the RENDERED output
  const re4 = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let m4, idx4 = 0;
  while ((m4 = re4.exec(evalResult)) !== null) {
    idx4++;
    try {
      new Function(m4[1]);
      console.log('  Rendered Script', idx4, ': VALID JS');
    } catch (e) {
      console.log('  Rendered Script', idx4, ': INVALID JS -', e.message);
      // Try to find the exact location
      const content = m4[1];
      const lines = content.split('\n');
      // Try parsing line by line to narrow down
      let accumulator = '';
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        accumulator += lines[lineIdx] + '\n';
        try {
          new Function(accumulator);
        } catch (lineErr) {
          // Still invalid but that's expected for incomplete code
          // Check if this specific line introduced a NEW error type
        }
      }
      // Binary search for the error
      let lo = 0, hi = lines.length - 1;
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2);
        const partial = lines.slice(0, mid + 1).join('\n');
        try {
          new Function(partial);
          lo = mid + 1;
        } catch (err) {
          if (err.message.includes('Invalid or unexpected')) {
            hi = mid;
          } else {
            // Different error (like unexpected end) means the syntax error is later
            lo = mid + 1;
          }
        }
      }
      console.log('  Error likely around rendered line', lo + 1);
      console.log('  Context (lines', Math.max(1, lo - 2), 'to', Math.min(lines.length, lo + 4), '):');
      for (let k = Math.max(0, lo - 2); k <= Math.min(lines.length - 1, lo + 3); k++) {
        const line = lines[k];
        const marker = k === lo ? ' >>>' : '    ';
        console.log(marker, (k + 1) + ':', JSON.stringify(line));
      }
    }
  }
} catch (e) {
  console.log('Eval FAILED:', e.message);
  console.log('This means the template literal itself has issues');
}

import fs from 'fs';

const content = fs.readFileSync('src/lib/baselineJihad.ts', 'utf8');
const docIdRegex = /"((2026_Q[12]_mohammed_jihad_[^"]+))"/g;
let m;
const foundIds = new Set();
while ((m = docIdRegex.exec(content)) !== null) {
  foundIds.add(m[1]);
}
console.log('Total 2026 Q1/Q2 Jihad docs in baselineJihad:', foundIds.size);
console.log(Array.from(foundIds).sort());

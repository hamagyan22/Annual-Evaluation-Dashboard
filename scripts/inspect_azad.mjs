import fs from 'fs';

const content = fs.readFileSync('src/lib/baselineAzad.ts', 'utf8');
// extract by regex
const targetIds = [
  '2026_Q1_mohammed_azad_amar_hussein',
  '2026_Q2_mohammed_azad_amar_hussein',
  '2026_Q1_mohammed_azad_salam_sadam',
  '2026_Q2_mohammed_azad_salam_sadam'
];

targetIds.forEach(id => {
  const idx = content.indexOf(`"${id}"`);
  if (idx !== -1) {
    const chunk = content.substring(idx, idx + 1000);
    console.log(`=== Found ${id} ===`);
    console.log(chunk.substring(0, 400));
  } else {
    console.log(`=== Not found ${id} ===`);
  }
});

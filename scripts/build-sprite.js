const fs = require('fs');
const path = require('path');

const icons = [
  "arrow-right","arrow-up","badge-check","book-open","calendar-clock","check","chevron-down",
  "clock","dog","eye","feather","footprints","gift","hand-heart","heart-handshake",
  "heart","leaf","loader-2","lock","map-pin","map","menu","messages-square","paw-print",
  "send","shield-check","sparkles","sprout","sun","unlock","user-round",
  "users-round","users","x"
];

async function fetchSvg(name) {
  const res = await fetch(`https://unpkg.com/lucide-static@latest/icons/${name}.svg`);
  if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status}`);
  const data = await res.text();
  // Strip outer <svg ...> and </svg>
  const inner = data.replace(/<!--[\s\S]*?-->/, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '').trim();
  return { name, inner };
}

async function run() {
  console.log('Fetching 32 Lucide SVGs using native fetch (following redirects)...');
  const svgData = await Promise.all(icons.map(fetchSvg));

  // Build SVG sprite symbol
  let sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n';
  svgData.forEach(({ name, inner }) => {
    sprite += `  <symbol id="icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n    ${inner}\n  </symbol>\n`;
  });
  sprite += '</svg>\n';

  fs.writeFileSync(path.join(__dirname, 'sprite.svg.html'), sprite);
  console.log('SVG sprite successfully generated with real vector paths.');
}

run().catch(console.error);

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = process.argv[2] || '.';
let fail = 0;

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = re.exec(html))) {
    i++;
    try {
      new vm.Script(m[1], { filename: `${file}#inline${i}` });
    } catch (err) {
      fail++;
      console.log(`FAIL ${file} bloco ${i}: ${err.message}`);
    }
  }
  console.log(`${file}: ${i} bloco(s) inline verificado(s)`);
}

// checa se todos os src referenciados existem
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(dir, file), 'utf8');
  const re = /(?:src|href)="((?!https?:|data:|#|mailto:)[^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const target = path.join(dir, m[1]);
    if (!fs.existsSync(target)) {
      fail++;
      console.log(`FALTA ARQUIVO: ${file} -> ${m[1]}`);
    }
  }
}

console.log(fail === 0 ? '\nTUDO OK' : `\n${fail} problema(s)`);

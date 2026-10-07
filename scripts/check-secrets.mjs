import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => !file.endsWith('.env.example'));

const rules = [
  { name: 'arquivo de ambiente versionado', test: /(^|\/)\.env(?:\..+)?$/ },
  { name: 'credencial Plugfield codificada', test: /(?:DEFAULT_(?:USERNAME|PASSWORD|API_KEY)|PLUGFIELD_(?:USERNAME|PASSWORD|API_KEY)\s*=\s*["'][^"']{4,})/ },
];

const findings = [];
for (const file of files) {
  if (rules[0].test.test(file)) findings.push(`${file}: ${rules[0].name}`);
  try {
    const content = readFileSync(file, 'utf8');
    if (rules[1].test.test(content)) findings.push(`${file}: ${rules[1].name}`);
  } catch {
    // Arquivos binários não participam da checagem textual.
  }
}

if (findings.length) {
  console.error('Possíveis segredos encontrados:\n' + findings.map((item) => `- ${item}`).join('\n'));
  process.exit(1);
}

console.log('Checagem de segredos concluída: nenhum padrão conhecido foi encontrado em arquivos versionados.');

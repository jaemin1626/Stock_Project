import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const modified = execFileSync('git',['diff','--name-only'],{ encoding:'utf8' }).trim().split('\n');
const created = execFileSync('git',['ls-files','--others','--exclude-standard'],{ encoding:'utf8' }).trim().split('\n');
const files = [...new Set([...modified,...created,'.env.example'])].filter(p => p && !p.endsWith('-full-code.md') && p !== 'package-lock.json' && !p.startsWith('.env.local')).sort();
let output = '# 2단계 생성·수정 파일 전체\n\n원본 upstream: 38da6d45e714b36b1cf56e945c290b70684eb03b\n\npackage-lock.json 전체는 ../package-lock.json 파일에 포함됩니다.\n\n';
for (const file of files) output += `## ${file}\n\n\`\`\`\n${fs.readFileSync(file,'utf8')}\n\`\`\`\n\n`;
fs.writeFileSync('docs/foundation-full-code.md',output);

import { spawnSync } from 'node:child_process';

const candidates = [process.env.PYTHON, process.platform === 'win32' ? 'python' : 'python3', 'python'].filter(Boolean);
let last;

for (const command of [...new Set(candidates)]) {
  const result = spawnSync(command, ['tests/python-smoke.py'], { stdio: 'inherit' });
  last = result;
  if (result.status === 0) process.exit(0);
  if (result.error?.code !== 'ENOENT') break;
}

process.exit(last?.status ?? 1);

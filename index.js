const { spawn } = require('child_process');
const p = spawn('bash', ['-lc', 'npm start'], { stdio: 'inherit' });
p.on('exit', (code) => process.exit(code ?? 0));

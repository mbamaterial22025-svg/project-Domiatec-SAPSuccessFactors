const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🚀 Starting Weighted Kanban Fullstack Dev Environment');
console.log('   - Backend API: http://localhost:5000');
console.log('   - Frontend UI: http://localhost:3000');
console.log('====================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// 1. Spawn Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// 2. Spawn Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

function cleanup() {
  console.log('\nShutting down dev servers...');
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);


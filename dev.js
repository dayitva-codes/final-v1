const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWin = process.platform === 'win32';

// 1. Resolve Python executable
let pythonCmd = 'python';
const venvPythonWin = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(__dirname, 'venv', 'bin', 'python');

if (isWin && fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (!isWin && fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[32m%s\x1b[0m', '   Starting NCC Battalion Management System');
console.log('\x1b[36m%s\x1b[0m', '================================================\n');

// 2. Spawn FastAPI Backend (shell: false prevents path space quoting bugs on Windows)
console.log('\x1b[34m[BACKEND]\x1b[0m Starting FastAPI on http://127.0.0.1:8000 ...');
const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], {
  cwd: __dirname,
  shell: false,
  stdio: 'inherit'
});

// 3. Spawn Vite Frontend
console.log('\x1b[35m[FRONTEND]\x1b[0m Starting Vite on http://127.0.0.1:5173 ...');
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev', '--prefix', 'frontend'], {
  cwd: __dirname,
  shell: isWin ? true : false,
  stdio: 'inherit'
});

// Cleanup on exit
function shutdown() {
  console.log('\n\x1b[33mShutting down all servers...\x1b[0m');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

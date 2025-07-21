#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

const PORT = 3000;

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    const platform = os.platform();
    
    if (platform === 'win32') {
      // Windows
      exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
        if (error || !stdout) {
          console.log(`✅ Puerto ${port} está libre`);
          resolve();
          return;
        }
        
        const lines = stdout.split('\n');
        const pids = new Set();
        
        lines.forEach(line => {
          const match = line.match(/LISTENING\s+(\d+)/);
          if (match) {
            pids.add(match[1]);
          }
        });
        
        if (pids.size === 0) {
          console.log(`✅ Puerto ${port} está libre`);
          resolve();
          return;
        }
        
        console.log(`🔄 Liberando puerto ${port}...`);
        const pidArray = Array.from(pids);
        let completed = 0;
        
        pidArray.forEach(pid => {
          exec(`taskkill /F /PID ${pid}`, (killError) => {
            completed++;
            if (killError) {
              console.log(`⚠️  No se pudo terminar el proceso ${pid}: ${killError.message}`);
            } else {
              console.log(`✅ Proceso ${pid} terminado`);
            }
            
            if (completed === pidArray.length) {
              setTimeout(() => {
                console.log(`✅ Puerto ${port} liberado`);
                resolve();
              }, 1000);
            }
          });
        });
      });
    } else {
      // Unix/Linux/macOS
      exec(`lsof -ti:${port}`, (error, stdout) => {
        if (error || !stdout.trim()) {
          console.log(`✅ Puerto ${port} está libre`);
          resolve();
          return;
        }
        
        const pids = stdout.trim().split('\n');
        console.log(`🔄 Liberando puerto ${port}...`);
        
        let completed = 0;
        pids.forEach(pid => {
          exec(`kill -9 ${pid}`, (killError) => {
            completed++;
            if (killError) {
              console.log(`⚠️  No se pudo terminar el proceso ${pid}: ${killError.message}`);
            } else {
              console.log(`✅ Proceso ${pid} terminado`);
            }
            
            if (completed === pids.length) {
              setTimeout(() => {
                console.log(`✅ Puerto ${port} liberado`);
                resolve();
              }, 1000);
            }
          });
        });
      });
    }
  });
}

function startNextDev() {
  console.log(`🚀 Iniciando Next.js en puerto ${PORT}...`);
  const nextProcess = exec('next dev -p 3000', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Error al iniciar Next.js: ${error.message}`);
      process.exit(1);
    }
  });
  
  nextProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  nextProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  nextProcess.on('close', (code) => {
    console.log(`Next.js terminó con código: ${code}`);
    process.exit(code);
  });
  
  // Manejar señales para terminar el proceso correctamente
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo servidor...');
    nextProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo servidor...');
    nextProcess.kill('SIGTERM');
  });
}

async function main() {
  console.log('🔍 Verificando puerto 3000...');
  await killProcessOnPort(PORT);
  startNextDev();
}

main().catch(console.error);

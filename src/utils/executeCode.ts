import { spawn } from 'child_process';

export async function executeCode(language: string, code: string, input = ''): Promise<string> {
  const dockerImage = getDockerImage(language);
  const commands = [
    'run',
    '--rm',
    '-i',
    '--network=none',
    '--cpus=0.5',
    '--memory=256m',
    '--pids-limit=128',
    dockerImage,
  ];

  return new Promise((resolve, reject) => {
    const dockerProcess = spawn('docker', commands, { timeout: 5000 });

    let output = '';
    let error = '';

    dockerProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    dockerProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    dockerProcess.on('close', (exitCode) => {
      if (exitCode === 0) {
        if (output.trim()) {
          resolve(output.trim());
        } else {
          resolve('No output produced.');
        }
      } else {
        reject(new Error(error.trim() || 'Execution error'));
      }
    });

    const delimiter = '---SPLIT---\n';
    const codeWithInput = `${code}\n${delimiter}${input}`;

    dockerProcess.stdin.write(codeWithInput);
    dockerProcess.stdin.end();
  });
}

function getDockerImage(language: string): string {
  switch (language) {
    case 'python':
      return 'python-executor';
    case 'javascript':
      return 'node-executor';
    case 'java':
      return 'java-executor';
    case 'cpp':
      return 'cpp-executor';
    case 'csharp':
      return 'csharp-executor';
    case 'php':
      return 'php-executor';
    case 'swift':
      return 'swift-executor';
    case 'rust':
      return 'rust-executor';
    case 'perl':
      return 'perl-executor';
    case 'haskell':
      return 'haskell-executor';
    default:
      throw new Error('Unsupported language');
  }
}
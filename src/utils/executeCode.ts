import { spawn } from 'child_process';

export async function executeCode(language: string, code: string, input = ''): Promise<string> {
  const dockerImage = getDockerImage(language);
  const commands = getDockerRunCommand(language);

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
        resolve(output);
      } else {
        reject(new Error(error || 'Execution error'));
      }
    });

    let codeWithInput = code;
    if (input) {
      codeWithInput += '\n---END-CODE---\n' + input;
    } else {
      codeWithInput += '\n---END-CODE---\n';
    }

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
    case 'c':
      return 'c-executor';
    case 'cpp':
      return 'cpp-executor';
    case 'csharp':
      return 'csharp-executor';
    default:
      throw new Error('Unsupported language');
  }
}

function getDockerRunCommand(language: string): string[] {
  const image = getDockerImage(language);
  return [
    'run',
    '--rm',
    '-i',
    '--network=none',
    '--cpus=1',
    '--memory=512m',
    '--pids-limit', '64',
    image,
  ];
}

import { spawn } from 'child_process';

export async function executeCode(language: string, code: string, input = ''): Promise<string> {
  const dockerImage = getDockerImage(language);

  return new Promise((resolve, reject) => {
    const dockerProcess = spawn('docker', [
      'run',
      '--rm',
      '-i',
      dockerImage,
    ]);

    let output = '';
    let error = '';

    dockerProcess.stdout.on('data', (data: { toString: () => string; }) => {
      output += data.toString();
    });

    dockerProcess.stderr.on('data', (data: { toString: () => string; }) => {
      error += data.toString();
    });

    dockerProcess.on('close', (code: number) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(error || 'Execution error'));
      }
    });

    dockerProcess.stdin.write(code);
    dockerProcess.stdin.end(input);
  });
}

function getDockerImage(language: string): string {
  switch (language) {
    case 'python':
      return 'python-executor';
      
    default:
      throw new Error('Unsupported language');
  }
}

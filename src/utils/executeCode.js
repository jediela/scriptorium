import { exec } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

const TIMEOUT = 5000;

function generateId() {
    return `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

export async function executeCode(language, code, input = '') {
  // create unique id for the temporary files
  const id = generateId();
  const fileDir = path.join('/tmp', id);

  try {
    let filePath, command;
    // language choice
    switch (language) {
      case 'c':
        filePath = `${fileDir}.c`;
        await writeFile(filePath, code);
        command = `gcc ${filePath} -o ${fileDir} && ${fileDir}`;
        break;
      case 'cpp':
        filePath = `${fileDir}.cpp`;
        await writeFile(filePath, code);
        command = `g++ ${filePath} -o ${fileDir} && ${fileDir}`;
        break;
      case 'java':
        filePath = `${fileDir}.java`;
        await writeFile(filePath, code);
        command = `javac ${filePath} && java -cp /tmp ${id}`;
        break;
      case 'python':
        filePath = `${fileDir}.py`;
        await writeFile(filePath, code);
        command = `python3 ${filePath}`;
        break;
      case 'javascript':
        filePath = `${fileDir}.js`;
        await writeFile(filePath, code);
        command = `node ${filePath}`;
        break;
      default:
        throw new Error('Unsupported language');
    }

    const output = await executeCommand(command, input);

    await unlink(filePath);
    if (language === 'c' || language === 'cpp' || language === 'java') {
      await unlink(fileDir);
    }

    return output;
  } catch (error) {
    throw new Error(error.message || 'Execution error');
  }
}

// standard input execution
function executeCommand(command, input) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { timeout: TIMEOUT }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr || 'Execution timed out');
      } else {
        resolve(stdout || stderr);
      }
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

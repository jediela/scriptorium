const { Readable } = require('stream');

let codeAndInput = '';

process.stdin.on('data', (chunk) => {
  codeAndInput += chunk.toString();
});

process.stdin.on('end', () => {
  const delimiter = '---SPLIT---\n';
  const [code, inputData = ''] = codeAndInput.split(delimiter);

  const inputStream = new Readable();
  inputStream.push(inputData);
  inputStream.push(null);

  const originalConsoleLog = console.log;
  let output = '';
  console.log = function (...args) {
    output += args.join(' ') + '\n';
  };

  try {
    eval(code);

    process.stdout.write(output);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    console.log = originalConsoleLog;
  }
});

const { Readable } = require('stream');

let codeWithInput = '';

process.stdin.on('data', function(chunk) {
  codeWithInput += chunk.toString();
});

process.stdin.on('end', function() {
  let [code, inputData] = codeWithInput.split('---END-CODE---');
  inputData = inputData || '';

  const inputStream = new Readable();
  inputStream.push(inputData);
  inputStream.push(null);

  const originalStdin = process.stdin;

  process.stdin = inputStream;

  try {
    eval(code);
  } catch (err) {
    console.error(err);
  } finally {
    process.stdin = originalStdin;
  }
});

const fs = require('fs');

let codeWithInput = '';

process.stdin.on('data', function(chunk) {
  codeWithInput += chunk.toString();
});

process.stdin.on('end', function() {
  let [code, inputData] = codeWithInput.split('---INPUT---');
  inputData = inputData || '';
  const stdin = require('stream').Readable.from([inputData]);
  const originalStdin = process.stdin;
  process.stdin = stdin;

  try {
    eval(code);
  } catch (err) {
    console.error(err);
  } finally {
    process.stdin = originalStdin;
  }
});

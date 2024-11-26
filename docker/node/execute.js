const fs = require('fs');
const { spawn } = require('child_process');

let code_and_input = '';
process.stdin.on('data', function (chunk) {
    code_and_input += chunk;
});

process.stdin.on('end', function () {
    const delimiter = '---SPLIT---\n';
    const parts = code_and_input.split(delimiter);

    const code = parts[0];
    const input_data = parts[1] || '';

    fs.writeFileSync('program.js', code);

    const nodeProcess = spawn('node', ['program.js']);

    nodeProcess.stdin.write(input_data);
    nodeProcess.stdin.end();

    nodeProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

    nodeProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });

    nodeProcess.on('close', (code) => {
        process.exit(code);
    });
});

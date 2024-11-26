<?php
$code_and_input = file_get_contents('php://stdin');

$delimiter = "---SPLIT---\n";
$parts = explode($delimiter, $code_and_input, 2);

$code = $parts[0];
$input_data = $parts[1] ?? '';

$code = preg_replace('/^\s*<\?php\s*/', '', $code);
$code = preg_replace('/\s*\?>\s*$/', '', $code);

$code_file = tempnam(sys_get_temp_dir(), 'code') . '.php';
file_put_contents($code_file, "<?php\n" . $code);

$descriptor_spec = [
    0 => ["pipe", "r"], // stdin
    1 => ["pipe", "w"], // stdout
    2 => ["pipe", "w"]  // stderr
];

$process = proc_open("php $code_file", $descriptor_spec, $pipes);

if (is_resource($process)) {
    fwrite($pipes[0], $input_data);
    fclose($pipes[0]);

    $output = stream_get_contents($pipes[1]);
    $error = stream_get_contents($pipes[2]);

    fclose($pipes[1]);
    fclose($pipes[2]);

    $return_value = proc_close($process);

    if ($return_value === 0) {
        echo $output;
    } else {
        fwrite(STDERR, $error);
        exit(1);
    }
}

unlink($code_file);

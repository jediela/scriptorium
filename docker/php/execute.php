<?php
$code_and_input = stream_get_contents(STDIN);

$delimiter = "---SPLIT---\n";
list($code, $input_data) = explode($delimiter, $code_and_input, 2);

if ($input_data === null) {
    $input_data = '';
}

$input_stream = fopen('php://memory', 'r+');
fwrite($input_stream, $input_data);
rewind($input_stream);
define('STDIN', $input_stream);

try {
    eval($code);
} catch (Throwable $e) {
    fwrite(STDERR, $e->getMessage());
    exit(1);
}
?>

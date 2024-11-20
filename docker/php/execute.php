<?php
$code_with_input = '';
while (($line = fgets(STDIN)) !== false) {
    $code_with_input .= $line;
}

list($code, $input_data) = explode('---END-CODE---', $code_with_input . '---END-CODE---');

$input_stream = fopen('php://memory', 'r+');
fwrite($input_stream, $input_data);
rewind($input_stream);
$GLOBALS['stdin'] = $input_stream;

ob_start();
eval('?>' . $code);
$output = ob_get_clean();
echo $output;

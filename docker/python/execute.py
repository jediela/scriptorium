import sys
import io

code_and_input = sys.stdin.read()

delimiter = '---SPLIT---\n'
code, _, input_data = code_and_input.partition(delimiter)

sys.stdin = io.StringIO(input_data)

from contextlib import redirect_stdout, redirect_stderr
output = io.StringIO()
error = io.StringIO()

try:
    with redirect_stdout(output), redirect_stderr(error):
        exec(code, {})
    print(output.getvalue())
except Exception as e:
    print(error.getvalue(), file=sys.stderr)
    print(f"{e.__class__.__name__}: {e}", file=sys.stderr)
    sys.exit(1)

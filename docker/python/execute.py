import sys

code_with_input = sys.stdin.read()

if '---INPUT---' in code_with_input:
    code, input_data = code_with_input.split('---INPUT---', 1)
    sys.stdin = io.StringIO(input_data)
else:
    code = code_with_input

try:
    exec(code)
except Exception as e:
    print(e, file=sys.stderr)

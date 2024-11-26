#!/bin/bash

delimiter='---SPLIT---\n'
code_and_input=$(cat)

IFS= read -r -d '' code <<<"$(printf '%s\n' "$code_and_input" | awk "/$delimiter/{exit} {print}")"
input=$(printf '%s\n' "$code_and_input" | awk "f; /$delimiter/{f=1}")

echo "$code" > main.dart

echo "$input" | dart run main.dart

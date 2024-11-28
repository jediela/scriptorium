#!/bin/sh

delimiter='---SPLIT---'
code_and_input=$(cat)

code=$(echo "$code_and_input" | awk "/$delimiter/{exit} {print}")
input=$(echo "$code_and_input" | awk "f; /$delimiter/{f=1}")

echo "$code" > main.rs

rustc main.rs
if [ $? -ne 0 ]; then
  exit 1
fi

echo "$input" | ./main

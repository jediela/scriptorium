#!/bin/sh

delimiter='---SPLIT---'
code_and_input=$(cat)

code=$(echo "$code_and_input" | awk "/$delimiter/{exit} {print}")
input=$(echo "$code_and_input" | awk "f; /$delimiter/{f=1}")

echo "$code" > main.go

echo "$input" | go run main.go

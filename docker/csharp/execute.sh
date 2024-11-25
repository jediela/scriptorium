#!/bin/bash

delimiter='---SPLIT---'
code_and_input=$(cat)

code=$(echo "$code_and_input" | awk "/$delimiter/{exit} {print}")
input=$(echo "$code_and_input" | awk "f; /$delimiter/{f=1}")

dotnet new console -o app --force > /dev/null 2>&1

echo "$code" > app/Program.cs

cd app

dotnet restore > /dev/null 2>&1

echo "$input" | dotnet run --no-restore

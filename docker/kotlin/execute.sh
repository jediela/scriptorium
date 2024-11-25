#!/bin/bash

source "/home/coder/.sdkman/bin/sdkman-init.sh"

delimiter='---SPLIT---'
code_and_input=$(cat)

code=$(echo "$code_and_input" | awk "/$delimiter/{exit} {print}")
input=$(echo "$code_and_input" | awk "f; /$delimiter/{f=1}")

echo "$code" > Main.kt

kotlinc Main.kt -include-runtime -d Main.jar
if [ $? -ne 0 ]; then
  exit 1
fi

echo "$input" | java -jar Main.jar

#!/bin/bash

delimiter='---SPLIT---'
code_and_input=$(cat)

code=$(echo "$code_and_input" | sed -e "/$delimiter/,\$d")
input=$(echo "$code_and_input" | sed -n -e "/$delimiter/,\$p" | sed -e "1d")

echo "$code" > Main.hs

ghc Main.hs -o program >/dev/null
if [ $? -ne 0 ]; then
  echo "Compilation failed:" >&2
  cat Main.hi >&2
  exit 1
fi

echo "$input" | ./program

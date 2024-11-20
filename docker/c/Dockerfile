FROM gcc:latest

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "awk '/---END-CODE---/{exit} {print}' > program.c && gcc program.c -o program && awk 'f{print} /---END-CODE---/{f=1}' | ./program"]

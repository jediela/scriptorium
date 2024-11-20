FROM golang:1.17

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "awk '/---END-CODE---/{exit} {print}' > main.go && awk 'f{print}' ORS='' /---END-CODE---/{f=1} | go run main.go"]
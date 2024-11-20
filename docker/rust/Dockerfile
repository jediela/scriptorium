FROM rust:1.56

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "awk '/---END-CODE---/{exit} {print}' > main.rs && awk 'f{print}' ORS='' /---END-CODE---/{f=1} | rustc main.rs && ./main"]

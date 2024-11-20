FROM swift:5.5

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "awk '/---END-CODE---/{exit} {print}' > main.swift && awk 'f{print}' ORS='' /---END-CODE---/{f=1} | swift main.swift"]

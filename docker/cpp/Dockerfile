FROM gcc:latest

RUN useradd -m coder

USER coder
WORKDIR /home/coder

COPY execute.cpp /home/coder/execute.cpp

CMD ["sh", "-c", "g++ execute.cpp -o execute && ./execute"]

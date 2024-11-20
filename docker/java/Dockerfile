FROM openjdk:11-jdk-slim

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "
  awk '/---END-CODE---/{exit} {print}' > Main.java &&
  javac Main.java &&
  awk 'f{print} /---END-CODE---/{f=1}' | java Main
"]

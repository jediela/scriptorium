FROM openjdk:11-jdk-slim

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "cat > Main.java && javac Main.java && java Main"]

FROM openjdk:11-jdk-slim

RUN curl -s https://get.sdkman.io | bash
RUN bash -c "source /root/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "kotlinc Main.kt -include-runtime -d Main.jar && java -jar Main.jar"]
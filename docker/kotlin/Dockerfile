FROM openjdk:11-jdk-slim

RUN apt-get update && apt-get install -y curl zip unzip

RUN curl -s https://get.sdkman.io | bash && \
    bash -c "source /root/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

RUN useradd -m coder
WORKDIR /home/coder

COPY execute.sh /home/coder/execute.sh
RUN chmod +x /home/coder/execute.sh && chown coder:coder /home/coder/execute.sh

USER coder

CMD ["./execute.sh"]

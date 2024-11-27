FROM openjdk:11-jdk-slim

RUN useradd -m coder
WORKDIR /home/coder

COPY execute.sh /home/coder/execute.sh
RUN chmod +x /home/coder/execute.sh && chown coder:coder /home/coder/execute.sh

USER coder

CMD ["./execute.sh"]

FROM perl:latest

RUN useradd -m coder
WORKDIR /home/coder

COPY execute.pl /home/coder/execute.pl

USER coder

CMD ["perl", "execute.pl"]

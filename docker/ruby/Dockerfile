FROM ruby:3.0

RUN useradd -m coder

USER coder
WORKDIR /home/coder

COPY execute.rb /home/coder/execute.rb

CMD ["ruby", "execute.rb"]
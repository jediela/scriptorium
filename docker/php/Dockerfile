FROM php:8-cli

RUN useradd -m coder

USER coder
WORKDIR /home/coder

COPY execute.php /home/coder/execute.php

CMD ["php", "execute.php"]
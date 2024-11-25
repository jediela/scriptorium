FROM node:16-alpine

RUN adduser -D coder

USER coder
WORKDIR /home/coder

COPY execute.js /home/coder/execute.js

CMD ["node", "execute.js"]

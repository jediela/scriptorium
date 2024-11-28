FROM python:3.9-slim

RUN useradd -m coder

USER coder
WORKDIR /home/coder

COPY execute.py /home/coder/execute.py

CMD ["python3", "execute.py"]

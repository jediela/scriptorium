FROM mcr.microsoft.com/dotnet/sdk:5.0

RUN useradd -m coder

USER coder
WORKDIR /home/coder

COPY Program.cs /home/coder/Program.cs

CMD ["sh", "-c", "dotnet new console -n app && mv Program.cs app/Program.cs && cd app && dotnet run"]

FROM mcr.microsoft.com/dotnet/sdk:5.0

RUN useradd -m coder

USER coder
WORKDIR /home/coder

CMD ["sh", "-c", "awk '/---END-CODE---/{exit} {print}' > Program.cs && dotnet new console -o app && mv Program.cs app/Program.cs && cd app && dotnet run"]

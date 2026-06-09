# Stage 1: Frontend build
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Backend build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

COPY src/Backend/ ./Backend/
RUN dotnet restore "Backend/Bolao.Api/Bolao.Api.csproj"

COPY src/Backend/ ./Backend/
RUN dotnet publish "Backend/Bolao.Api/Bolao.Api.csproj" -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /app/frontend/dist ./wwwroot

EXPOSE 8080
ENTRYPOINT ["dotnet", "Bolao.Api.dll"]

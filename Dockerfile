# Stage 1: build
FROM node:18 AS build
WORKDIR /app

# Copia os package.json para instalar dependências
COPY package*.json ./

# Instala dependências de forma determinística
RUN npm ci

# Copia todo o código
COPY . .

# Build — força base relativo para evitar problemas com caminhos
# (a flag --base=./ gera assets com caminhos relativos)
RUN npm run build -- --base=./

# Gera fallback 404 para SPA (rota funciona em servidores estáticos)
RUN cp -f dist/index.html dist/404.html

# Stage 2: serve com nginx
FROM nginx:alpine
# Remove conteúdo default do nginx (opcional)
RUN rm -rf /usr/share/nginx/html/*
# Copia build final para pasta do nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

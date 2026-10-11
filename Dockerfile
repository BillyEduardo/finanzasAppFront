# syntax=docker/dockerfile:1

# Etapa 1: construir Angular (Node)
# Etapa 2: servir los archivos estáticos con Nginx
FROM node:22-alpine AS build

WORKDIR /app

# Primero solo las dependencias: Docker cachea esta capa si package*.json no cambia
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# production + docker: mismo build de producción, pero apiUrl vacío.
# El navegador llama a /api en este Nginx, y Nginx lo reenvía al contenedor del API.
RUN npm run build -- --configuration=production,docker

# Etapa final: imagen pequeña solo con Nginx + el dist
FROM nginx:1.27-alpine AS final

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/finanzasAppFront/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

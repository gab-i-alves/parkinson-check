# Estágio 1: Build da aplicação Angular
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio 2: Servir a aplicação com Nginx
FROM nginx:alpine
COPY --from=build /app/dist/parkinson-check-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
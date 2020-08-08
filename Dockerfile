FROM node:10 as build

COPY ./music_graph /app

WORKDIR app
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /webroot
COPY nginx.conf /etc/nginx/

EXPOSE 80

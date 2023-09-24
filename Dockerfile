FROM node:18-alpine





ENV WEB_PORT=7490

COPY app /usr/app
WORKDIR /usr/app

RUN npm install -g serve
CMD serve -p 7490 build

EXPOSE 7490




FROM node:18-alpine




EXPOSE 7490
ENV WEB_PORT=7490

COPY app /usr/app
WORKDIR /usr/app


CMD yarn start -p $WEB_PORT


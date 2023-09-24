FROM node:18-alpine





ENV WEB_PORT=7490
ENV PORT=7490
COPY app /usr/app
WORKDIR /usr/app





CMD yarn start --port 7490

EXPOSE 7490


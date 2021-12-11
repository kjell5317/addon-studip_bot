FROM node:current-alpine

ENV LANG C.UTF-8

WORKDIR /server

RUN apk add --no-cache \
    nodejs \
    npm

COPY ["package*.json", "./"]

RUN npm i

COPY . .

CMD ["node", "index.js"]
FROM node:current-alpine

ENV LANG C.UTF-8

WORKDIR /server

COPY src/package.json .

RUN npm i

COPY src .

CMD ["node", "index.js"]
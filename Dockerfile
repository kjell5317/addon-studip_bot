FROM node:latest

ENV LANG C.UTF-8

WORKDIR /server

COPY ["package*.json", "./"]

RUN npm i

COPY . .

CMD ["node", "index.js"]
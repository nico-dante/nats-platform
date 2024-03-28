FROM node:20.11-alpine

WORKDIR /usr/src/app

ADD package*.json ./
RUN npm ci
ADD . .
RUN npm run build

RUN npm install --location=global ts-node

CMD npm run start:prod

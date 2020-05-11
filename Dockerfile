FROM node:12.16.3-alpine3.11

EXPOSE 3333

WORKDIR /usr/src/app

COPY package.json package.json

RUN npm install && npm cache clean --force

COPY . .

CMD [ "node", "./bin/www" ]

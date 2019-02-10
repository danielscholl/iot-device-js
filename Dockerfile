FROM node:8

WORKDIR /usr/src/app
COPY package.json ./

RUN npm install

ENV NODE_ENV=production
COPY index.js .
COPY lib ./lib

CMD ["node", "index.js"]

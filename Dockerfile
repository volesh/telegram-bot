FROM node:18.15.0

RUN mkdir /api

WORKDIR /api

EXPOSE 3000

COPY package*.json .

RUN npm i

COPY . .

RUN npm run build

CMD [ "npm", "run", "start" ]
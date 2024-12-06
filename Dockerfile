FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./ .

EXPOSE $port

CMD [ "npm", "run", "prod"]
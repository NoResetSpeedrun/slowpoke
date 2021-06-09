FROM node:latest

RUN mkdir /code
WORKDIR /code

COPY package.json .
COPY yarn.lock .

RUN yarn install

CMD ["yarn", "dev"]

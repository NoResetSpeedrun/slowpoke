FROM node:latest

RUN mkdir /code
WORKDIR /code

COPY .babelrc.json .
COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY src ./src

CMD ["yarn", "start"]

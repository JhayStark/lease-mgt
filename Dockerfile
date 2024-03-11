FROM node:18-alpine

WORKDIR /app
COPY package.json yarn.lock ./
COPY package.json /app/
RUN yarn install
COPY . .

CMD ["yarn", "start"]
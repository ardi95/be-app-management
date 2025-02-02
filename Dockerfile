FROM node:23.6.0

WORKDIR /usr/src/app

COPY . .

RUN npm install


CMD ["npm", "run", "dev"]

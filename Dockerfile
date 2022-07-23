FROM node:14.7.0-alpine as base
WORKDIR /usr/src/app

COPY ../package*.json ./

EXPOSE $PORT

FROM base as development

RUN npm install
COPY ../ .
RUN npm run build
RUN npm install -g nodemon

CMD ["npm", "run", "start:dev"]

FROM base as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm ci
COPY ../tsconfig.json ../tsconfig.build.json ./
COPY ../src ./src
RUN npm run build

CMD [ "node", "dist/main"]
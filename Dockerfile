FROM node:14.15.0-alpine3.12 AS base
ENV APP=/app
WORKDIR $APP
COPY package.json package-lock.json $APP/
RUN npm install
COPY . $APP

FROM node:14.15.0-alpine3.12 AS release
ENV NODE_ENV=production
ENV APP=/app
WORKDIR $APP
COPY package.json package-lock.json $APP/
RUN npm install --only=prod
COPY . $APP
RUN chmod +x /app/dockerEntryPoint.sh

ENTRYPOINT [ "/app/dockerEntryPoint.sh" ]

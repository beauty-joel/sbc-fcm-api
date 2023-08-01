FROM node:18-bullseye-slim AS build
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm install --omit=dev

FROM gcr.io/distroless/nodejs:18
COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app
EXPOSE 3000
CMD [ "server.js" ]
# multi-stage build

# first build the app
FROM node:12.16.1-alpine

#ADD yarn.lock /yarn.lock
#ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin

WORKDIR /app
ADD . /app
RUN yarn install --frozen-lockfile --non-interactive --silent

CMD ["yarn", "build"]

# then create a simple nginx container to serve the compiled app
FROM nginx:stable-alpine
COPY --from=0 /app/build /usr/share/nginx/html
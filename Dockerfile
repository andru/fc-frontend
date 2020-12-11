# multi-stage build

# first build the app
FROM node:14.15-alpine AS builder

#ADD yarn.lock /yarn.lock
#ADD package.json /package.json

ENV NODE_PATH=/node_modules
ENV PATH=$PATH:/node_modules/.bin
ENV NGINX_PORT=8080
ENV NGINX_HOST=localhost

WORKDIR /app
ADD . /app
RUN yarn install --frozen-lockfile --non-interactive 
#--silent
RUN yarn build 

# then create a simple nginx container to serve the compiled app
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf
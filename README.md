# Flora Commons Front-end
The frontend for the Flora Commons project.

## Summary
This is a `create-react-app` application with a Docker config to build and deploy to a lightweight `nginx-alpine` container.

It uses the official MediaWiki javascript libraries to interface with a wikibase endpoint.

## How To
### Developing
Run `yarn start` from the base directory to deploy a development server on localhost:3000. File changes are watched and the app refreshed. 

### Deploying
#### Deploying stand alone
`docker build -t fc-frontend .`
`docker run --name fc-frontend_1 -d -p 8080:80 fc-frontend`

#### As part of a docker-compose config
fc-frontend:
  build: https://github.com/andru/fc-frontend.git
  ports:
   - "8080:80"
  environment:
   - NGINX_HOST=foobar.com
   - NGINX_PORT=80

## Technology and Libraries
### Javascript libraries
* create-react-app
* reactjs
* react-router-dom
* styled-components
* semantic-ui-react
* wikibase-sdk

### Other libraries & technoliges
* docker
* nginx:alpine
* node:alpine (for build step)
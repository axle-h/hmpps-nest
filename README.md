# HMPPS Nest App

Skeleton nest app with a govuk & moj ui.

## Running
The easiest way to run the app is to use docker compose to create the service and all dependencies.

`docker-compose pull`

`docker-compose up`

### Dependencies
The app requires:
* hmpps-auth - for authentication
* redis - session store and token caching

### Development

To start the main services excluding the example typescript template app:

`docker-compose up hmpps-auth redis`

Install dependencies using `npm install`, ensuring you are using >= `Node v14.x`

Finally, to build the assets and start the app with nodemon:

`npm run start:dev`

### Run linter

`npm run lint`

### Run tests

`npm run test`

FROM node:16-alpine

WORKDIR /app

# Install app dependencies.
COPY package.json ./

RUN npm --loglevel error install

# Copy files (other than whatever is in .dockerignore) to the working directory.
COPY . ./

FROM node:16-alpine AS builder

WORKDIR /app

# Install dependencies.
COPY package.json ./

RUN npm --loglevel error install

# Copy files (other than whatever is in .dockerignore) to the working directory.
COPY . .

RUN npm run build

###############################################################################
# Server
###############################################################################

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app ./


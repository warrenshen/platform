# Docker Image which is used as foundation to create
# a custom Docker Image with this Dockerfile
FROM node:19.0.0

# A directory within the virtualized Docker environment
# Becomes more relevant when using Docker Compose later
COPY . /app
WORKDIR /app

# Copies package.json and package-lock.json to Docker environment
COPY package.json .
COPY yarn.lock .

# Installs all node packages
ENV NODE_ENV=development
RUN yarn install

# Uses port which is used by the actual application
EXPOSE 3006

# Finally runs the application
CMD yarn start-test

# Dockerfile to front-end server to run in development mode
# Specify the base image
FROM node:14-alpine as builder

# Set the working directory
WORKDIR /app

# Copy the package.json
COPY package.json ./app/

# Install the dependencies
RUN npm install

# Copy the source code
COPY . /app/

# Expose the port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "start"]
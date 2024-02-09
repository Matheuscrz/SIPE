# Dockerfile to API server to run in production mode
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

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
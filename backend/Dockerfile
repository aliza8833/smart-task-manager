FROM node:22-alpine
WORKDIR /app

# Install required build tools and matching node development headers
RUN apk add --no-cache python3 make g++ nodejs-dev

# Copy package files and install dependencies (compiling natively in the same environment)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code and build the project
COPY . .
RUN npm run build

# Create the persistent data directory for SQLite and grant write permissions
RUN mkdir -p /app/data && chmod 777 /app/data

EXPOSE 4000
CMD ["node", "dist/main"]
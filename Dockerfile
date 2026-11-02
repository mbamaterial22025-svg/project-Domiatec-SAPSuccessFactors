FROM node:22-alpine

WORKDIR /app

# Copy package configurations
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm --prefix backend install
RUN npm --prefix frontend install

# Copy source code
COPY . .

# Build frontend and initialize database
RUN npm --prefix frontend run build
RUN npm --prefix backend run db:init

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["npm", "--prefix", "backend", "start"]


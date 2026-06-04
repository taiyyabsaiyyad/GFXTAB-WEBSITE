# Dockerfile for MockupAI Studio Backend API
# GFXTAB Productions · Taiyyab Saiyyad

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]

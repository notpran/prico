FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY src ./src
ENV PORT=8000
EXPOSE 8000
CMD ["node", "src/server.js"]

FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000 3003

CMD ["npx", "serverless", "offline", "--host", "0.0.0.0", "--stage", "local"]

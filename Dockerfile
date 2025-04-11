FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --build-from-source

COPY . .
RUN npx prisma generate
RUN npm run build

CMD ["npm", "run", "start:prod"]

EXPOSE 3000

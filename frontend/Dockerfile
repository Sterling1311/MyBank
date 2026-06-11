FROM node:20-alpine

WORKDIR /app

# Copie des dépendances en premier (cache Docker)
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
FROM node:20-alpine

# Instalar OpenSSL para Prisma
RUN apk update && apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Gerar Prisma Client
RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "dev"]
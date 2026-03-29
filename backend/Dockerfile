FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
COPY prisma/ ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
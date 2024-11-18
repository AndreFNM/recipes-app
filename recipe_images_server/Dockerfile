FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install @types/express @types/multer --save-dev

RUN npm install -g typescript

COPY . .

RUN tsc -p tsconfig.server.json

EXPOSE 5001

CMD ["node", "dist/app.js"]

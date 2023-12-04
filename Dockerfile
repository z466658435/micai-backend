FROM node:18.12-slim

# 程序路径
WORKDIR /usr/src/app/backend

# COPY package.json ./

COPY . .

RUN npm install cnpm -g --registry=https://registry.npmmirror.com
RUN cnpm install

EXPOSE 8800
EXPOSE 8801
CMD [ "npm", "start" ]
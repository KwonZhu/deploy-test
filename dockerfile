FROM node:14-alpine

WORKDIR /app

#COPY package.json package.json
#COPY package-lock.json package-lock.json
#COPY index.js index.js
#将以上的COPY步骤简化
COPY . .
#把当前目录下的所有内容(通过.dockerignore使得不包含node_modules, .env)copy到container的app文件夹下

RUN npm i

#dockerfile使用tips：为了让docker在rebuild image时使用缓存=>速度快，把易被改动的代码放下面，把不容易改动的代码(譬如COPY)放前面
ENTRYPOINT [ "npm", "start" ]

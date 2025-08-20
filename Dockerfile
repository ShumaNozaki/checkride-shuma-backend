FROM node:20

# RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y ffmpeg


WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

EXPOSE 4000

CMD [ "npm", "start" ]
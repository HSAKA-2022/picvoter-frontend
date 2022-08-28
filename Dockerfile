FROM node

RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN yarn install

RUN yarn build


ENTRYPOINT ["yarn", "start", "--host"]

FROM node:18-alpine3.14

ARG API_URL

ENV VITE_API_ENDPOINT=$API_URL

COPY      . /var/www

WORKDIR   /var/www/web

RUN yarn install
RUN yarn build

WORKDIR   /var/www

RUN yarn install
RUN yarn build

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

CMD /wait && yarn db:migrate && yarn start

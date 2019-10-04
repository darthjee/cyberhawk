FROM darthjee/node:0.0.7

USER root
RUN npm install -g bower
USER node

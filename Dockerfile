FROM node:18

# Create app directory
WORKDIR /usr/src/app
ARG ENV

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN apt update && apt install -y \
    python3 \   
    make \
    g++ \
    python3-pip

RUN pip3 install stability_sdk
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
RUN apt update && apt install -y awscli memcached 
RUN apt-get update && apt-get install telnet && apt-get install -y cron supervisor

COPY . .
EXPOSE 5000


RUN crontab -l | { cat; echo "0 0 * * * root . /usr/src/app/.env; sh /usr/src/app/cron/dailyPostPublication.sh 2>&1"; } | crontab -
RUN crontab -l | { cat; echo "* * * * * root . /usr/src/app/.env; sh /usr/src/app/cron/seedImageCron.sh 2>&1"; } | crontab -
RUN crontab -l | { cat; echo "* * * * * root . /usr/src/app/.env; sh /usr/src/app/cron/whisperStatusPollCron.sh 2>&1"; } | crontab -

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["bash", "start.sh"]
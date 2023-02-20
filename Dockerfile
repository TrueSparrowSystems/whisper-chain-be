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
RUN apt-get update && apt-get install telnet



COPY . .

EXPOSE 5000
RUN printf '0 0 * * * . /usr/src/app/.env; sh /usr/src/app/cron/dailyPostPublication.sh\n' >> /root/crontab
RUN printf '* * * * * . /usr/src/app/.env; sh /usr/src/app/cron/seedImageCron.sh\n' >> /root/crontab
RUN printf '* * * * * . /usr/src/app/.env; sh /usr/src/app/cron/whisperStatusPollCron.sh\n#' >> /root/crontab
RUN apt-get install -y cron
RUN touch /var/log/cron.log
RUN crontab /root/crontab
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN chmod 600 /etc/crontab
CMD ["bash", "start.sh"]
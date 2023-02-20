#!/bin/sh
i=0;
while [ $i -lt 6 ]; do # 6 ten-second intervals in 1 minute
  node /usr/src/app/lib/cron/whisperStatusPolling.js >> /tmp/whisperStatusPolling.log
  sleep 10
  i=$(( i + 1 ))
done

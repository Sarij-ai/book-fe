#!/bin/bash
cd /var/www/app/frontend
pm2 start "npm start" --name book-fe -o /var/log/app/frontend/out.log -e /var/log/app/frontend/error.log

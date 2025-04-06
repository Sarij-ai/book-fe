#! /bin/bash
out=$(pm2 delete book-fe 2>&1)
code=$?
if [[ $code -eq 1 ]] && [[ $out == "[PM2][ERROR] Process or Namespace book-fe not found" ]]; then
  exit 0;
fi
exit $code

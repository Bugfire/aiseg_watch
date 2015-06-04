# aiseg_watch

requires mysql module

    # npm install mysql

aiseg_watch.sh example

    #!/bin/sh
    # for crontab
    # * * * * * /AISEG_WATH_PATH/aiseg_watch/aiseg_watch.sh

    cd `dirname "${0}"`
    /NODE_JS_PATH/node aiseg_watch.js

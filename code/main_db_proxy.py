# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

from db_proxy import main

app = main.app

if __name__ == "__main__":
    # no nginx, else the __name__ would be "db_proxy" (because db_proxy.py)
    app.run(host='0.0.0.0', debug=True, port=80)
# end if


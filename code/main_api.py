# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging, LevelByNameFilter

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

from api import main

app = main.app

print("## LOADED ##")
def setup_logging():
    filter = LevelByNameFilter(logging.WARNING, debug="api.main, node.messages", info="node, api")
    logging.add_colored_handler(level=logging.DEBUG, date_formatter="%Y-%m-%d %H:%M:%S", filter=filter)
    logging.test_logger_levels()
# end def

setup_logging()

if __name__ == "__main__":
    # no nginx, else the __name__ would be "api" (because api.py)
    app.run(host='0.0.0.0', debug=True, port=80)
# end if


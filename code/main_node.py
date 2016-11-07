# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

from node.main import setup_logging, main

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


if __name__ == '__main__':  # if this is the executed file
    setup_logging()
    main()
# end if main()

# -*- coding: utf-8 -*-
import os

from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

NODE_PORT = int(os.environ.get("NODE_PORT", None))

DEBUG = os.environ.get("NODE_DEBUG", "")
if DEBUG.lower() in ["true", "yes", "1"]:
    DEBUG = True
else:
    DEBUG = False
# end if


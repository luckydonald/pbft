# -*- coding: utf-8 -*-
import os
from datetime import timedelta

from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
__all__ = ["NODE_PORT", "NODES_CACHING_TIME", "DEBUGGER"]

logger = logging.getLogger(__name__)


NODE_PORT = int(os.environ.get("NODE_PORT", None))


# DOCKER_CACHING_TIME in seconds
docker_caching_time_seconds = os.environ.get("DOCKER_CACHING_TIME", None)
if docker_caching_time_seconds is None:
    DOCKER_CACHING_TIME = None
else:
    DOCKER_CACHING_TIME = timedelta(seconds=float(docker_caching_time_seconds))
# end if


DEBUGGER = os.environ.get("NODE_DEBUGGER", "")
if DEBUGGER.lower() in ["true", "yes", "1"]:
    DEBUGGER = True
else:
    DEBUGGER = False
# end if

DATABASE_URL = "http://db_proxy/dump/"

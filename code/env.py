# -*- coding: utf-8 -*-
import os

from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

THIS_NODE = int(os.environ.get("NODE_ID"))  # p

TOTAL_NODES = int(os.environ.get("NODE_TOTAL"))  # n

POSSIBLE_FAILURES = int(os.environ.get("POSSIBLE_FAILURES"))  # t

NODE_HOST_PREFIX = os.environ.get("NODE_HOST_PREFIX", None)
assert NODE_HOST_PREFIX is not None

NODE_PORT = int(os.environ.get("NODE_PORT", None))
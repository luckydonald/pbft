# -*- coding: utf-8 -*-
import os

from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

POSTGRES_HOST = os.environ.get("POSTGRES_HOST", None)
assert POSTGRES_HOST is not None

POSTGRES_USER = os.environ.get("POSTGRES_USER", None)
assert POSTGRES_USER is not None

POSTGRES_PASS = os.environ.get("POSTGRES_PASS", None)
assert POSTGRES_PASS is not None

POSTGRES_DB = os.environ.get("POSTGRES_DB", None)
assert POSTGRES_DB is not None



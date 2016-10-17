# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

INIT = 1
LEADER_CHANGE = 2
PROPOSE = 3
PREVOTE = 4
VOTE = 5

all = [INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE]
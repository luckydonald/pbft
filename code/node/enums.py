# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

__all__ = ["UNSET", "INIT", "PROPOSE", "PREVOTE", "VOTE", "LEADER_CHANGE", "ACKNOWLEDGE", "all"]

UNSET = 0
INIT = 1
PROPOSE = 2
PREVOTE = 3
VOTE = 4
LEADER_CHANGE = 5

ACKNOWLEDGE = -1

all = [UNSET, INIT, PROPOSE, PREVOTE, VOTE, LEADER_CHANGE, ACKNOWLEDGE]

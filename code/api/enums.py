# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging
from node.enums import INIT, PROPOSE,PREVOTE, VOTE
__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

JSON_TYPES = {
    INIT: "init",
    PROPOSE: "propose",
    PREVOTE: "prevote",
    VOTE: "vote",
}
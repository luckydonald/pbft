# -*- coding: utf-8 -*-
from time import sleep

from luckydonaldUtils.logger import logging

from algo.main import BFT_ARM

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

if __name__ == '__main__':
    logging.add_colored_handler(logger_name=__name__, level=logging.INFO)
    logging.add_colored_handler(logger_name="algo", level=logging.INFO)
    for file in "main,todo,messages".split(","):
        logging.add_colored_handler(logger_name="algo." + file, level=logging.DEBUG)
    # end def
    old_sequence = None
    foo = BFT_ARM(old_sequence=old_sequence)
    foo.new_sequence()
    logger.info("Sleeping 2 seconds to give other nodes the time to get the receiver ready.")
    sleep(2)
    foo.task_normal_case()
    old_sequence = foo.sequence_no
    while True:
        logger.info("Starting new Round.")
        foo = BFT_ARM(old_sequence=old_sequence)
        foo.new_sequence()
        foo.task_normal_case()
        old_sequence = foo.sequence_no
    # end while
# end if

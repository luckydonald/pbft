# -*- coding: utf-8 -*-
from time import sleep

from luckydonaldUtils.logger import logging

from algo.main import BFT_ARM

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

do_quit = False

def main():
    algo = BFT_ARM()
    sequence = algo.new_sequence()
    receiver = algo.get_receiver()

    logger.info("Sleeping 2 seconds to give other nodes the time to get the receiver ready.")
    sleep(2)

    while not do_quit:
        logger.debug("Starting new Round.")
        algo = BFT_ARM(sequence_number=sequence, receiver=receiver)
        sequence = algo.new_sequence()
        algo.task_normal_case()
    # end while
    logger.info("Exiting.")
# end def


def setup_logging():
    logging.add_colored_handler(logger_name=None, level=logging.WARNING)  # root logger -> WARNING
    logging.add_colored_handler(logger_name=__name__, level=logging.DEBUG)  # this file -> DEBUG
    logging.add_colored_handler(logger_name="algo", level=logging.INFO)  # all algo files -> INFO
    for file in "main,todo,messages".split(","):
        logging.add_colored_handler(logger_name="algo." + file, level=logging.DEBUG)  # specific algo files -> DEBUG
    # end for
# end def

if __name__ == '__main__':  # if this is the executed file
    setup_logging()
    main()
# end if main()

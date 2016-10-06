# -*- coding: utf-8 -*-
from time import sleep

from luckydonaldUtils.logger import logging, LevelByNameFilter

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
    filter = LevelByNameFilter(logging.WARNING, debug="algo.main, algo.todo, algo.messages", info="algo")
    logging.add_colored_handler(level=logging.DEBUG, date_formatter="%Y-%m-%d %H:%M:%S", filter=filter)
    logging.test_logger_levels()
# end def


if __name__ == '__main__':  # if this is the executed file
    setup_logging()
    main()
# end if main()

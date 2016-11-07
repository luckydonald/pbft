# -*- coding: utf-8 -*-
from time import sleep

from luckydonaldUtils.logger import logging, LevelByNameFilter

from .algo import BFT_ARM

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


do_quit = False


def main():
    algo = BFT_ARM()
    sequence = algo.new_sequence()
    receiver = algo.get_receiver()
    setup_cleanup(algo)

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


def setup_cleanup(algo):
    import signal
    import sys
    assert isinstance(algo, BFT_ARM)

    def signal_handler(signal, frame):
        print('You pressed Ctrl+C!')
        global do_quit
        do_quit = True
        assert isinstance(algo, BFT_ARM)
        algo.stop()
        sys.exit(0)
    # end def
    signal.signal(signal.SIGINT, signal_handler)
# end def


def setup_logging():
    filter = LevelByNameFilter(logging.WARNING, debug="node.main, node.todo, node.messages", info="node")
    logging.add_colored_handler(level=logging.DEBUG, date_formatter="%Y-%m-%d %H:%M:%S", filter=filter)
    logging.test_logger_levels()
# end def

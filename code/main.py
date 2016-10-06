# -*- coding: utf-8 -*-
from time import sleep

from luckydonaldUtils.logger import logging, ColoredStreamHandler

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


from luckydonaldUtils.logger import logging, ColoredStreamHandler


class LoggingFilterByName(object):
    def __init__(self, root=logging.WARNING, debug=None, info=None, success=None, warning=None, error=None, critical=None, by_level=None):
        """
        A filter where you specify logging levels bound to names (package names, as known from importing)

        :param root: level the root should have to be logged. None to disable.

        :param debug: all loggers which should log debug and above.
        :param info: all loggers which should log info and above.
        :param success: all loggers which should log success and above.
        :param warning: all loggers which should log warning and above.
        :param error: all loggers which should log error and above.
        :param critical: all loggers which should log critical and above.

        :param by_level: a dict with levels as a key, and names to log as value.
                        Example: {10: "__main__", 20: "a.b.c", 30: ["a.b.d", "a.b.e"], logging.WARNING: "a"}
        """
        self.mapping = dict()
        if root:
            if isinstance(root, str):
                root = logging.getLoglevelInt(root)
            assert isinstance(root, int)
            self.mapping[""] = root
        # end
        level = logging.DEBUG
        self.parse_argument(debug, logging.DEBUG)
        self.parse_argument(info, logging.INFO)
        self.parse_argument(success, logging.SUCCESS)
        self.parse_argument(warning, logging.WARNING)
        self.parse_argument(error, logging.ERROR)
        self.parse_argument(critical, logging.CRITICAL)

        if by_level:
            assert isinstance(by_level, dict)
            for level, files in by_level.items():
                self.parse_argument(files, level)
            # end for
        # end if
    # end def

    def parse_argument(self, argument, level):
        if argument:
            if isinstance(argument, tuple):
                argument = list(argument)
            if not isinstance(argument, list):
                argument = [argument]
            # end if
            assert isinstance(argument, list)
            for part in argument:
                if isinstance(part, (list, tuple)):
                    argument.extend(part)
                elif not isinstance(part, str):
                    raise TypeError("argument {val!r} is type {type}, should be str.".format(val=part, type=type(part)))
                elif "," in part:
                    argument.append(part.split(","))
                else:
                    self.mapping[part.strip() + "."] = level
                # end if
            # end for
        # end if
    # end def

    def filter(self, record):
        if not self.mapping:
            return False  # allow
        # end if

        name = record.name + "."
        mapping_path = ""  # default is "" = root

        for k in self.mapping:
            if name.startswith(k):
                if len(mapping_path) < len(k):  # we got a longer path. longer = more specific.
                    mapping_path = k
                # end if
            # end if
        # end for

        if mapping_path in self.mapping:  # e.g. root "" is not specified.
            level = self.mapping[mapping_path]
            return record.levelno >= level
        # end if
        return False
    # end def
# end class

def setup_logging():
    filter = LoggingFilter(logging.WARNING, debug="algo.main, algo.todo, algo.messages", info="algo")
    logging.add_colored_handler(level=logging.DEBUG, date_formatter="%Y-%m-%d %H:%M:%S", filter=filter)



def debug_logger(loggername):
    l = logging.getLogger(loggername)
    l.debug("test DEBUG")
    l.info("test INFO")
    l.success("test SUCCESS")
    l.warning("test WARNING")
    l.error("test ERROR")
    l.critical("test CRITICAL")
# end def

# end def

if __name__ == '__main__':  # if this is the executed file
    # setup_logging()
    main()
# end if main()

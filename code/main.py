# -*- coding: utf-8 -*-

# built in modules
import sys
from time import sleep
from statistics import median

# dependency modules
from luckydonaldUtils.logger import logging

# own modules
from networks.sender import send_message
from networks.receiver import Receiver
from functions import flatten_list
from messages import InitMessage, LeaderChangeMessage, ProposeMessage, PrevoteMessage, VoteMessage
from env import THIS_NODE, TOTAL_NODES, POSSIBLE_FAILURES, DEBUG
import todo

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

if DEBUG:
    sys.path.append("libs/pycharm-debug-py3k.egg")
    try:
        import pydevd
    except ImportError:
        sys.path.remove("libs/pycharm-debug-py3k.egg")
        logger.warning("Debug disabled.")
    # end def
    try:
        pydevd.settrace('192.168.188.20', port=49872, stdoutToServer=True, stderrToServer=True, suspend=False)
        logger.success("Debugger connected.")
    except Exception:
        logger.warning("No debugger.")
    # end try
else:
    logger.debug("Debugger disabled via $NODE_DEBUG.")
# end if


# init
# sensor_value = 0.4 # vp
# THIS_NODE = 0  # p
# TOTAL_NODES = 4 # n
# POSSIBLE_FAILURES = 1 # t
# value_store = {}  # INIT_Store
# current_leader = 0 # o
# sequence_no = None # cid
P = {}
LC = {}  # leader change






class BFT_ARM():
    sequence_no = None
    should_timeout = False

    def __init__(self):
        self.value_store = {}  # INIT_Store
        self.current_leader = 0  # ø
        self.rec = Receiver()
        self.rec.start()
    # end def

    def MsgCollect(self):
        received_message = self.get_specific_message_type(InitMessage, LeaderChangeMessage)
        if isinstance(received_message, InitMessage):
            self.value_store[received_message.node] = received_message
        elif isinstance(received_message, LeaderChangeMessage):
            # TODO: LC <- LC u {received_message}
            logger.warning("not implemented.")
            pass
        if todo.timeout():
            # BFT_ARM.task_leader_change()
            # todo.timeout.reset()
            pass
            # end if
    # end def

    def task_normal_case(self):
        value = todo.get_sensor_value()  # vp
        send_message(InitMessage(self.sequence_no, THIS_NODE, value))
        # TODO: Wo bekommt das die seq no her?
        if THIS_NODE == self.current_leader:
            # CURRENT LEADER
            if self.sequence_no is None:
                self.sequence_no = 0
            else:
                self.sequence_no = (self.sequence_no + 1) % 256
            while not (len(self.value_store) > TOTAL_NODES - POSSIBLE_FAILURES):
                # wait until |INIT_Store| > n ≠ t
                logger.success("")
                init_msg = self.get_specific_message_type(InitMessage)
                self.value_store[init_msg.node] = init_msg
                # todo
            # end
            # broadcast(ÈPROPOSE, cid, p, proposal, INIT_StoreÍ‡p )
            proposal = median(self.value_store.values())
            send_message(ProposeMessage(self.sequence_no, THIS_NODE, self.current_leader, proposal, self.value_store))
        # end if
        prop_message = self.get_specific_message_type(ProposeMessage)
        if self.verify_proposal(prop_message):
            send_message(PrevoteMessage(self.sequence_no, THIS_NODE, self.current_leader, value))
        # if exist v:|<PREVOTE,cid,·,„,vÍ‡·|>(n+t)

        # hier auch, weil timeout uns notfalls rettet.
        prevote_buffer = dict()  # dict with P inside
        vote_buffer = dict()  # just decide
        while not self.should_timeout:
            msg = self.get_specific_message_type(PrevoteMessage, VoteMessage)
            if isinstance(msg, PrevoteMessage):
                value, is_enough = self.buffer_incomming(msg, prevote_buffer)
                if is_enough:
                    send_message(VoteMessage(self.sequence_no, THIS_NODE, self.current_leader, value))
                # end def
            elif isinstance(msg, VoteMessage):
                value, is_enough = self.buffer_incomming(msg, vote_buffer)
                if is_enough:
                    return value
                # end if
            # end if
        # end while
    # end def run

    def buffer_incomming(self, msg, buffer):
        if not msg.value in buffer:
            buffer[msg.value] = list()
        # end if
        assert isinstance(buffer[msg.value], list)
        buffer[msg.value].append(msg)
        return msg.value, len(buffer[msg.value]) > (TOTAL_NODES + POSSIBLE_FAILURES) / 2
    # end def

    def verify_proposal(self, msg):
        """
        Überprüfe ob proposal vom leader ist und
        Rechnen nach, das die von msg empfangenen InitMessages den von ihm berechneten Wert (proposal) ergeben.
        :param msg:
        :return:
        """
        # TODO: optimieren, indem man leader abfrage nach oben schiebt?
        # if not msg.leader == self.current_leader:
        #     return False
        s = list()
        assert isinstance(msg, ProposeMessage)
        for init_msg in msg.value_store:
            assert isinstance(init_msg, InitMessage)
            s.append(init_msg.value)
        return msg.leader == self.current_leader and median(s) == msg.proposal
    # end def

    def get_specific_message_type(self, *classes_or_types, sequence_number=None):
        msg = None
        classes_or_types = flatten_list(classes_or_types)

        while msg is None:
            msg = self.rec.pop_message()
            if isinstance(msg, *classes_or_types):
                logger.warning("Allowed Message:\n{}".format(msg))
                return msg
            elif sequence_number is not None and msg.sequence_no != sequence_number:
                logger.warning("Discarded Message (wrong sequence number):\n{}".format(msg))
            else:
                logger.warning("Discarded Message (wrong type):\n{}".format(msg))
            # end if
        # end while
    # end def
# end class

if __name__ == '__main__':
    logging.add_colored_handler(level=logging.DEBUG)
    foo = BFT_ARM()
    foo.task_normal_case()
    while True:
        sleep(1)
        logger.info("idle...")
    # end while
# end if
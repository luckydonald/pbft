# -*- coding: utf-8 -*-

# built in modules
import sys
from datetime import timedelta
from time import sleep
from statistics import median

# dependency modules
from luckydonaldUtils.functions import cached
from luckydonaldUtils.logger import logging

# own modules
from .message_queue import MessageQueueReceiver
from .networks.sender import send_message
from .functions import flatten_list
from .messages import InitMessage, LeaderChangeMessage, ProposeMessage, PrevoteMessage, VoteMessage
from .env import DEBUG
from . import todo

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
# self.node_number = 0  # p
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

    def __init__(self, old_sequence=None):
        self.value_store = {}  # INIT_Store
        self.current_leader = 1  # ø
        self.rec = MessageQueueReceiver()
        self.rec.start()
        self.sequence_no = old_sequence
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
        logger.critical("Step 0 INIT>")
        send_message(InitMessage(self.sequence_no, self.node_number, value))
        # TODO: Wo bekommt das die seq no her?
        logger.info("I'm node [{self!r}], [{leader!r}] is leader, {filler}.".format(
            leader=self.current_leader, self=self.node_number,
            filler="it's a me" if self.node_number == self.current_leader else "not me"
        ))
        if self.node_number == self.current_leader:
            logger.critical("Step 1.0 (leader)")
            # CURRENT LEADER
            # self.new_sequence()
            while not (len(self.value_store) >= (self.nodes_total - self.nodes_faulty)):
                # wait until |INIT_Store| > n - t
                logger.success("INITs: {} > {}".format(len(self.value_store), (self.nodes_total - self.nodes_faulty)))
                init_msg = self.rec.init_queue.pop_message()
                assert isinstance(init_msg, InitMessage)
                self.value_store[init_msg.node] = init_msg
            # end
            proposal = median([x.value for x in self.value_store.values()])
            send_message(ProposeMessage(
                self.sequence_no, self.node_number, self.current_leader, proposal, list(self.value_store.values())
            ))
            logger.critical("Step 1.1 PROPOSAL>")
        # end if
        logger.critical("Step 2.0 >PROPOSAL")
        prop_message = self.rec.propose_queue.pop_message()
        assert isinstance(prop_message, ProposeMessage)
        if self.verify_proposal(prop_message):
            send_message(PrevoteMessage(self.sequence_no, self.node_number, self.current_leader, value))
            logger.critical("Step 2.1 PROPOSAL>")
        # if exist v:|<PREVOTE,cid,·,„,vÍ‡·|>(n+t)

        # hier auch, weil timeout uns notfalls rettet.
        prevote_buffer = dict()  # dict with P inside
        vote_buffer = dict()  # just decide
        logger.critical("Step 3.0 >(PRE)VOTE")
        while not self.should_timeout:
            if self.rec.prevote_queue.has_message():
                msg = self.rec.prevote_queue.pop_message()
                value, is_enough = self.buffer_incomming(msg, prevote_buffer)
                if is_enough:
                    send_message(VoteMessage(self.sequence_no, self.node_number, self.current_leader, value))
                    logger.critical("Step 3.1 PRE-VOTE>")
                    # end def
            elif self.rec.vote_queue.has_message():
                msg = self.rec.vote_queue.pop_message()
                value, is_enough = self.buffer_incomming(msg, vote_buffer)
                if is_enough:
                    logger.critical("Step 3.2 VOTE>")
                    logger.success("Value is {val}".format(val=value))
                    return value
                # end if
            # end if
        # end while
        logger.critical("Step 4 End.")
    # end def run

    def new_sequence(self):
        if self.sequence_no is None:
            self.sequence_no = 0
        else:
            self.sequence_no = (self.sequence_no + 1) % 256
        # end if
        logger.info("Sequence: {i}".format(i=self.sequence_no))
    # end def

    def buffer_incomming(self, msg, buffer):
        if not msg.value in buffer:
            buffer[msg.value] = list()
        # end if
        assert isinstance(buffer[msg.value], list)
        buffer[msg.value].append(msg)
        return msg.value, len(buffer[msg.value]) > (self.nodes_total + self.nodes_faulty) / 2
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
        values = list()
        known_nodes = list()

        if not isinstance(msg, ProposeMessage):
            raise AttributeError("msg is not ProposeMessage type, but {type}:\n{val}".format(type=type(msg), val=msg))
        for init_msg in msg.value_store:
            assert isinstance(init_msg, InitMessage)  # right message type
            assert init_msg.node not in known_nodes  # no duplicates
            values.append(init_msg.value)  # store the value
            known_nodes.append(init_msg.node)  # remember this node
        # end for
        return msg.leader == self.current_leader and median(values) == msg.proposal
    # end def

    def get_specific_message_type(self, *classes_or_types, sequence_number=None):
        msg = None
        classes_or_types = flatten_list(classes_or_types)
        classes_or_types = tuple(classes_or_types)

        while True:  # todo: something better
            msg = self.rec.pop_message()
            if isinstance(msg, classes_or_types):
                logger.success("Got Message: {}".format(msg))
                break
            elif sequence_number is not None and msg.sequence_no != sequence_number:
                logger.warning("Discarded Message (wrong sequence number): {}".format(msg))
                msg = None
            else:
                logger.warning("Discarded Message (wrong type): {}".format(msg))
                msg = None
            # end if
        # end while
        return msg
    # end def

    @property
    @cached(max_age=timedelta(seconds=60))
    def nodes_total(self):
        from .dockerus import ServiceInfos
        return len(ServiceInfos().other_numbers(exclude_self=False))
    # end def

    @property
    @cached(max_age=timedelta(seconds=60))
    def nodes_faulty(self):
        return (self.nodes_total - 1)/3
    # end def

    @property
    def node_number(self):
        from .dockerus import ServiceInfos
        return ServiceInfos().number
    # end def
# end class

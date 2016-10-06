# -*- coding: utf-8 -*-
import threading
from collections import deque

from DictObject import DictObject
import json
from luckydonaldUtils.logger import logging

from .messages import Message, InitMessage, ProposeMessage, PrevoteMessage, VoteMessage
from .networks.receiver import Receiver

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


class LockedQueue(object):
    def __init__(self, clazz):
        assert issubclass(clazz, Message)
        self._clazz = clazz
        self._queue = deque()
        self._new_messages = threading.Semaphore(0)
        self._queue_access = threading.Lock()

    def pop_message(self):
        """
        Get a message.
        :return:
        """
        logger.debug("Called pop_message on {type}.".format(type=self._clazz))
        self._new_messages.acquire()  # waits until at least 1 message is in the queue.
        with self._queue_access:
            message = self._queue.popleft()  # pop oldest item
            logger.debug('Messages waiting in queue: %d', len(self._queue))
            if not isinstance(message, self._clazz):
                raise TypeError("Popped message is not type {_clazz} but type {type}:\n{msg}".format(
                    _clazz=self._clazz, type=type(message), msg=message
                ))
            # end if
            assert isinstance(message, Message)
            assert isinstance(message, self._clazz)
            return message
        # end with
    # end def

    def get_message(self, sequence_number=None):
        if sequence_number is None:  # no check needed:
            return self.pop_message()
        # end if
        msg = None
        while msg is None:
            msg = self.pop_message()
            if msg.sequence_no != sequence_number:
                logger.warning("Discarded Message (wrong sequence number): {}".format(msg))
                msg = None
            # end if
        # end while
        assert isinstance(msg, Message)
        assert isinstance(msg, self._clazz)
        return msg
    # end def

    def append_message(self, message):
        if not isinstance(message, self._clazz):
            raise TypeError("Given message is not type {_clazz} but type {type}:\n{msg}".format(
                _clazz=self._clazz, type=type(message), msg=message
            ))
        # end if
        with self._queue_access:
            self._queue.append(message)
        # end if
        self._new_messages.release()
    # end def

    def queue_length(self):
        with self._queue_access:
            return len(self._queue)
        # end with
    # end def

    __len__ = queue_length

    def has_message(self):
        with self._queue_access:
            return len(self._queue) > 0
        # end with
    # end def
# end class


class MessageQueueReceiver(Receiver):
    init_queue = LockedQueue(InitMessage)
    propose_queue = LockedQueue(ProposeMessage)
    prevote_queue = LockedQueue(PrevoteMessage)
    vote_queue = LockedQueue(VoteMessage)

    pop_message = None  # the function

    def _add_message(self, text):
        """
        Appends a message to the message queue.

        :type text: builtins.str
        :return:
        """
        try:
            logger.debug("Received Message: \"{str}\"".format(str=text))
            json_dict = json.loads(text)
            message = DictObject.objectify(json_dict)
            message = self.parse_message(message)
        except ValueError as e:
            logger.warn("Received message could not be parsed.\nMessage:>{}<".format(text), exc_info=True)
            return
        if isinstance(message, InitMessage):
            self.init_queue.append_message(message)
        elif isinstance(message, ProposeMessage):
            self.propose_queue.append_message(message)
        elif isinstance(message, PrevoteMessage):
            self.prevote_queue.append_message(message)
        elif isinstance(message, VoteMessage):
            self.vote_queue.append_message(message)
        else:
            logger.warning("Discarded unknown message type: {msg_type}, {msg}".format(
                msg_type=type(message), msg=message
            ))
        # end if
    # end def
# end class

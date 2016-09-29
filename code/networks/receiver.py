# -*- coding: utf-8 -*-
import json
import threading
from collections import deque

from DictObject import DictObject
from luckydonaldUtils.logger import logging
from luckydonaldUtils.encoding import to_binary as b
from luckydonaldUtils.encoding import to_unicode as u
from luckydonaldUtils.encoding import to_native as n
import socket

from messages import Message

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


_EMPTY_RAW_BYTE = b("")
_ANSWER_SYNTAX = b("ANSWER ")
_LINE_BREAK = b("\n")


class Receiver(object):
    _queue = deque()
    _new_messages = threading.Semaphore(0)
    _queue_access = threading.Lock()

    def __init__(self):
        self._do_quit = False
    # end def

    def __receiver_logging_wrapper(self):
        try:
            self._receiver()
        except Exception:
            logger.exception("Receiver failed.")
        # end try
    # end def

    def _receiver(self):
        from env import NODE_HOST, THIS_NODE, NODE_PORT
        from errno import ECONNREFUSED

        node_host = NODE_HOST.format(i=THIS_NODE)
        if NODE_HOST == "localhost":
            node_host = "localhost"
        # end if
        logger.info("Starting receiver on {host}:{port}".format(host=node_host, port=NODE_PORT))
        while not self._do_quit:  # retry connection
            self.s = socket.socket(socket.AF_INET,  # Internet
                                   socket.SOCK_STREAM)  # TCP
            try:
                self.s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                self.s.bind((node_host, NODE_PORT))
                self.s.listen(5)
                client, info = self.s.accept()
                self.client = client
            except socket.error as error:
                self.s.close()
                if error.errno == ECONNREFUSED and not self._do_quit:
                    continue
                raise error  # Not the error we are looking for, re-raise
            except Exception as error:
                self.s.close()
                raise error
            logger.debug("Socket Set up.")
            buffer = _EMPTY_RAW_BYTE
            answer = _EMPTY_RAW_BYTE
            completed = -1  # -1 = answer size yet unknown, >0 = got remaining answer size
            while (not self._do_quit) and self.s:  # read loop
                while 1:  # retry if CTRL+C'd
                    try:
                        self.s.setblocking(True)
                        answer = self.client.recv(1)
                        # recv() returns an empty string if the remote end is closed
                        if len(answer) == 0:
                            self.s.close()
                            self.s = None
                            logger.warning("Remote end closed.")
                        # logger.debug("received byte: {}".format(answer))
                        break
                    except socket.error as err:
                        if self._do_quit:
                            self.s.close()
                            self.s = None
                        from errno import EINTR
                        if err.errno != EINTR:  # interrupted system call
                            raise
                        else:
                            logger.exception("Uncatched exception in reading answer from cli.")
                            self.s.close()
                            self.s = None
                            break  # to the retry connection look again.
                # end while: ctrl+c protection
                if not self.s:   # check if socket is still open
                    break
                if completed == 0:
                    logger.debug("Hit end.")
                    if answer != _LINE_BREAK:
                        raise ValueError("Message does not end with a double linebreak.")
                    if buffer == _EMPTY_RAW_BYTE:
                        logger.debug("skipping second linebreak.")
                        completed = -1
                        continue
                    logger.debug("Received Message: %s", buffer)
                    text = n(buffer)
                    if len(text) > 0 and text.strip() != "":
                        self._add_message(text)
                    else:
                        logger.warn("Striped text was empty.")
                    answer = _EMPTY_RAW_BYTE
                    buffer = _EMPTY_RAW_BYTE
                    # completed = 0 (unchanged)
                    continue
                buffer += answer
                if completed < -1 and buffer[:len(_ANSWER_SYNTAX)] != _ANSWER_SYNTAX[:len(buffer)]:
                    raise ArithmeticError("Server response does not fit. (Got >{}<)".format(buffer))
                if completed <= -1 and buffer.startswith(_ANSWER_SYNTAX) and buffer.endswith(_LINE_BREAK):
                    completed = int(n(buffer[len(_ANSWER_SYNTAX):-1]))  # TODO regex.
                    buffer = _EMPTY_RAW_BYTE
                completed -= 1
            # end while: read loop
            if self.s:
                self.s.close()
                self.s = None
        # end while not ._do_quit: retry connection
        if self.s:
            self.s.close()
            self.s = None
        # end if
    # end def

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
        with self._queue_access:
            self._queue.append(message)
            self._new_messages.release()
        # end with
    # end def

    def parse_message(self, dict):
        return Message.from_dict(dict)
    # end def

    def start(self):
        """
        Starts the receiver.
        When started, messages will be queued.
        :return:
        """
        self._receiver_thread = threading.Thread(name="Receiver", target=self.__receiver_logging_wrapper, args=())
        self._receiver_thread.daemon = True  # exit if script reaches end.
        self._receiver_thread.start()
        logger.success("Started Receiver Thread.")
    # end def

    def stop(self):
        """
        Shuts down the receivers server.
        No more messages will be received.
        You should not try to start() it again afterwards.
        """
        self._do_quit = True
        if self.s:
            self.s.settimeout(0)
        if self.s:
            self.s.close()
        if hasattr(self, "_receiver_thread"):
            logger.debug("receiver thread existing: {}".format(self._receiver_thread.isAlive()))
        else:
            logger.debug("receiver thread existing: Not created.")
            # self._new_messages.release()
        # end if

    from luckydonaldUtils.functions import caller

    def pop_message(self, call=None):
        """
        Get a message.
        :return:
        """
        self._new_messages.acquire()  # waits until at least 1 message is in the queue.
        with self._queue_access:
            message = self._queue.popleft()  # pop oldest item
            logger.debug('Messages waiting in queue: %d', len(self._queue))
            assert isinstance(message, Message)
            return message
        # end with
    # end def

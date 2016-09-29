# -*- coding: utf-8 -*-
import socket
from time import sleep

from luckydonaldUtils.logger import logging

from env import NODE_PORT
from messages import Message
from todo import logger

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

MSG_FORMAT = "ANSWER {length}\n{msg}\n"


def send_message(msg):
    logger.debug(msg)
    assert isinstance(msg, Message)
    import json
    broadcast(json.dumps(msg.to_dict()))
    return
# end def


def broadcast(message):
    from env import NODE_HOST
    from env import TOTAL_NODES
    from env import THIS_NODE
    for node in range(TOTAL_NODES):
        if node == THIS_NODE:
            continue  # skip ourself
        # end if
        node_host = NODE_HOST.format(i=node)
        if NODE_HOST == "localhost":
            node_host = "localhost"
        # end if
        # msg = MSG_FORMAT.format(length=len(message), msg=message)
        message += "\n"
        msg = "ANSWER " + str(len(message)) + "\n" + message
        logger.debug("Prepared sending to {host}:{port}:\n{msg}".format(host=node_host, port=NODE_PORT, msg=msg))
        msg = bytes(msg, "utf-8")
        sent = False
        while not sent:
            try:
                with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:  # UDP SOCK_DGRAM
                    logger.debug("Sending to {host}:{port}:\n{msg}".format(host=node_host, port=NODE_PORT, msg=msg))
                    sock.connect((node_host, NODE_PORT))
                    sock.sendall(msg)
                    sent = True
                # end with
            except OSError as e:
                logger.error("Sending to {host}:{port} failed: {e}".format(e=e, host=node_host, port=NODE_PORT))
                sleep(1)
            # end try
        # end while
    # end for
# end def
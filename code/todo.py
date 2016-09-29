# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

from env import NODE_PORT
from messages import Message

import socket
__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

MSG_FORMAT = "ANSWER {length}\n{msg}"


def send_message(msg):
    logger.debug(msg)
    assert isinstance(msg, Message)
    import json
    broadcast(json.dumps(msg.to_dict()))
    return
# end def


def broadcast(message):
    from env import NODE_HOST_PREFIX
    from env import TOTAL_NODES
    from env import THIS_NODE
    for node in range(TOTAL_NODES):
        if node == THIS_NODE:
            continue  # skip ourself
        # end if
        node_host = NODE_HOST_PREFIX + str(node)
        if NODE_HOST_PREFIX == "localhost":
            node_host = "localhost"
        # end if
        # msg = MSG_FORMAT.format(length=len(message), msg=message)
        msg = "ANSWER " + str(len(message)) + "\n" + message
        logger.info("Sending to {host}:{port}:\n{msg}".format(host=node_host, port=NODE_PORT, msg=msg))
        msg = bytes(msg, "utf-8")
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:  # UDP
            bytes_total_sent = 0
            while bytes_total_sent < len(msg):
                bytes_sent = sock.sendto(msg[bytes_total_sent:], (node_host, NODE_PORT))
                logger.debug("sent {} byte(s) [{}:{}]".format(bytes_sent, bytes_total_sent, bytes_total_sent + bytes_sent))
                bytes_total_sent += bytes_sent
            # end while
        # end with
    # end for
# end def


def get_sensor_value():
    return 0.5
# end def



def timeout():
    return False
# end def
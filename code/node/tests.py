# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

import unittest
from .messages import Message, InitMessage, ProposeMessage, PrevoteMessage, VoteMessage, Acknowledge
from .enums import INIT, PROPOSE, PREVOTE, VOTE, ACKNOWLEDGE


class TestJsonToObject(unittest.TestCase):
    data_InitMessage = {
        "type": INIT,
        "sequence_no": 12,
        "node": 1,
        "value": 0.5,
    }

    def check_InitMessage(self, msg):
        self.assertIsInstance(msg, InitMessage)
        self.assertEqual(msg.type, self.data_InitMessage["type"])
        self.assertEqual(msg.sequence_no, self.data_InitMessage["sequence_no"])
        self.assertEqual(msg.node, self.data_InitMessage["node"])
        self.assertEqual(msg.value, self.data_InitMessage["value"])
    # end def

    def test_InitMessage_toObject(self):
        msg = InitMessage.from_dict(self.data_InitMessage)
        self.check_InitMessage(msg)
    # end def

    def test_Message_toObject_InitMessage(self):
        msg = Message.from_dict(self.data_InitMessage)
        self.check_InitMessage(msg)
    # end def

    def test_InitMessage_toDict(self):
        data = self.data_InitMessage
        msg = InitMessage(data["sequence_no"], data["node"], data["value"])
        self.check_InitMessage(msg)
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    data_ProposeMessage = {
        "type": PROPOSE,
        "sequence_no": 12,
        "node": 1,
        "leader": 1,
        "proposal": 0.5,
        "value_store": [],
    }

    def check_ProposeMessage(self, msg):
        self.assertIsInstance(msg, ProposeMessage)
        self.assertEqual(msg.type, self.data_ProposeMessage["type"])
        self.assertEqual(msg.sequence_no, self.data_ProposeMessage["sequence_no"])
        self.assertEqual(msg.node, self.data_ProposeMessage["node"])
        self.assertEqual(msg.leader, self.data_ProposeMessage["leader"])
        self.assertEqual(msg.proposal, self.data_ProposeMessage["proposal"])
        self.assertListEqual(msg.value_store, [])
    #  end def

    def test_ProposeMessage_toObject(self):
        msg = ProposeMessage.from_dict(self.data_ProposeMessage)
        self.check_ProposeMessage(msg)
    # end def

    def test_Message_toObject_ProposeMessage(self):
        msg = Message.from_dict(self.data_ProposeMessage)
        self.check_ProposeMessage(msg)
    # end def

    def test_ProposeMessage_toDict(self):
        data = self.data_ProposeMessage
        msg = ProposeMessage(data["sequence_no"], data["node"], data["leader"], data["proposal"], [])
        self.check_ProposeMessage(msg)
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    data_PrevoteMessage = {
        "type": PREVOTE,
        "sequence_no": 12,
        "node": 1,
        "leader": 1,
        "value": 0.5,
    }

    def check_PrevoteMessage(self, msg):
        self.assertIsInstance(msg, PrevoteMessage)
        self.assertEqual(msg.type, self.data_PrevoteMessage["type"])
        self.assertEqual(msg.sequence_no, self.data_PrevoteMessage["sequence_no"])
        self.assertEqual(msg.node, self.data_PrevoteMessage["node"])
        self.assertEqual(msg.leader, self.data_PrevoteMessage["leader"])
        self.assertEqual(msg.value, self.data_PrevoteMessage["value"])
    # end def

    def test_PrevoteMessage_toObject(self):
        msg = PrevoteMessage.from_dict(self.data_PrevoteMessage)
        self.check_PrevoteMessage(msg)
    # end def

    def test_Message_toObject_PrevoteMessage(self):
        msg = Message.from_dict(self.data_PrevoteMessage)
        self.check_PrevoteMessage(msg)
    # end def

    def test_PrevoteMessage_toDict(self):
        data = self.data_PrevoteMessage
        msg = PrevoteMessage(data["sequence_no"], data["node"], data["leader"], data["value"])
        self.check_PrevoteMessage(msg)
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    data_VoteMessage = {
        "type": VOTE,
        "sequence_no": 12,
        "node": 1,
        "leader": 1,
        "value": 0.5,
    }

    def check_VoteMessage(self, msg):
        self.assertIsInstance(msg, VoteMessage)
        self.assertEqual(msg.type, self.data_VoteMessage["type"])
        self.assertEqual(msg.sequence_no, self.data_VoteMessage["sequence_no"])
        self.assertEqual(msg.node, self.data_VoteMessage["node"])
        self.assertEqual(msg.leader, self.data_VoteMessage["leader"])
        self.assertEqual(msg.value, self.data_VoteMessage["value"])
    # end def

    def test_VoteMessage_toObject(self):
        msg = VoteMessage.from_dict(self.data_VoteMessage)
        self.check_VoteMessage(msg)
    # end def

    def test_Message_toObject_VoteMessage(self):
        msg = Message.from_dict(self.data_VoteMessage)
        self.check_VoteMessage(msg)
    # end def

    def test_VoteMessage_toDict(self):
        data = self.data_VoteMessage
        msg = VoteMessage(data["sequence_no"], data["node"], data["leader"], data["value"])
        self.check_VoteMessage(msg)
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    data_Acknowledge = {
        "type": ACKNOWLEDGE,
        "sequence_no": 12,
        "node": 1,
        "sender": 1,
        "raw": {},
    }

    def check_Acknowledge(self, msg):
        self.assertIsInstance(msg, Acknowledge)
        self.assertEqual(msg.type, self.data_Acknowledge["type"])
        self.assertEqual(msg.sequence_no, self.data_Acknowledge["sequence_no"])
        self.assertEqual(msg.node, self.data_Acknowledge["node"])
        self.assertEqual(msg.sender, self.data_Acknowledge["sender"])
        self.assertDictEqual(msg.raw, self.data_Acknowledge["raw"])
    # end def

    def test_Acknowledge_toObject(self):
        msg = Acknowledge.from_dict(self.data_Acknowledge)
        self.check_Acknowledge(msg)
    # end def

    def test_Message_Acknowledge_toObject(self):
        msg = Message.from_dict(self.data_Acknowledge)
        self.check_Acknowledge(msg)
    # end def
# end class



if __name__ == '__main__':
    unittest.main()
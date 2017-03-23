# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

import unittest
from .messages import Message, InitMessage, ProposeMessage, PrevoteMessage, VoteMessage, Acknowledge
from .enums import UNSET, INIT, PROPOSE, PREVOTE, VOTE, ACKNOWLEDGE


class TestJsonToObject(unittest.TestCase):
    data_InitMessage = {
        "type": INIT,
        "sequence_no": 12,
        "node": 1,
        "value": 0.5,
    }

    def check_InitMessage(self, msg, data):
        self.assertIsInstance(msg, InitMessage)
        self.assertEqual(msg.type, data["type"])
        self.assertEqual(msg.sequence_no, data["sequence_no"])
        self.assertEqual(msg.node, data["node"])
        self.assertEqual(msg.value, data["value"])
    # end def

    def test_InitMessage_toObject(self):
        msg = InitMessage.from_dict(self.data_InitMessage)
        self.check_InitMessage(msg, self.data_InitMessage)
    # end def

    def test_Message_toObject_InitMessage(self):
        msg = Message.from_dict(self.data_InitMessage)
        self.check_InitMessage(msg, self.data_InitMessage)
    # end def

    def test_InitMessage_toDict(self):
        data = self.data_InitMessage
        msg = InitMessage(data["sequence_no"], data["node"], data["value"])
        self.check_InitMessage(msg, self.data_InitMessage)
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    def test_InitMessage_toString(self):
        msg = Message.from_dict(self.data_InitMessage)
        self.assertEqual("InitMessage(node=1, sequence_no=12, type=1, value=0.5)", str(msg))
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
    #  end def

    def test_ProposeMessage_toObject(self):
        msg = ProposeMessage.from_dict(self.data_ProposeMessage)
        self.check_ProposeMessage(msg)
        self.assertListEqual(msg.value_store, [])
    # end def

    def test_Message_toObject_ProposeMessage(self):
        msg = Message.from_dict(self.data_ProposeMessage)
        self.check_ProposeMessage(msg)
        self.assertListEqual(msg.value_store, [])
    # end def

    def test_ProposeMessage_toDict(self):
        data = self.data_ProposeMessage
        msg = ProposeMessage(data["sequence_no"], data["node"], data["leader"], data["proposal"], [])
        self.check_ProposeMessage(msg)
        self.assertListEqual(msg.value_store, [])
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    def test_ProposeMessage_toString(self):
        msg = Message.from_dict(self.data_ProposeMessage)
        self.assertEqual("ProposeMessage(leader=1, node=1, proposal=0.5, sequence_no=12, type=2, value_store=[])", str(msg))
    # end def

    data_ProposeMessage_with_InitMessage = {
        "type": PROPOSE,
        "sequence_no": 12,
        "node": 1,
        "leader": 1,
        "proposal": 0.5,
        "value_store": [data_InitMessage],
    }

    def test_ProposeMessage_with_InitMessage(self):
        msg = Message.from_dict(self.data_ProposeMessage_with_InitMessage)
        self.check_ProposeMessage(msg)
        self.assertEqual(len(msg.value_store), 1)
        self.check_InitMessage(msg.value_store[0], self.data_ProposeMessage_with_InitMessage["value_store"][0], )
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

    def test_PrevoteMessage_toString(self):
        msg = Message.from_dict(self.data_PrevoteMessage)
        self.assertEqual("PrevoteMessage(leader=1, node=1, sequence_no=12, type=3, value=0.5)", str(msg))
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

    def test_VoteMessage_toString(self):
        msg = Message.from_dict(self.data_VoteMessage)
        self.assertEqual("VoteMessage(leader=1, node=1, sequence_no=12, type=4, value=0.5)", str(msg))
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

    def test_Acknowledge_toDict(self):
        data = self.data_Acknowledge
        msg = Acknowledge(data["sequence_no"], data["node"], data["sender"], data["raw"])
        self.check_Acknowledge(msg)
        self.assertDictEqual(msg.to_dict(), data)
    # end def

    def test_Acknowledge_toString(self):
        msg = Message.from_dict(self.data_Acknowledge)
        self.assertEqual("Acknowledge(node=1, raw={}, sender=1, sequence_no=12, type=-1)", str(msg))
    # end def

    data_unknown_type1 = {
        "type": UNSET,
        "sequence_no": 12,
        "node": 1,
        "foo": "bar",
        "best_pony": "Littlepip"
    }

    def test_Init_unknown_type1_toObject(self):
        data = self.data_unknown_type1
        msg = Message.from_dict(data)
        self.assertIsInstance(msg, Message)
        self.assertEqual(msg.type, data["type"])
        self.assertEqual(msg.sequence_no, data["sequence_no"])
        # self.assertEqual(msg.node, data["node"])  # TODO put node to super, into Message
    # end def

    data_unknown_type2 = {
        "type": 4458,  # <- this is different to data_unknown_type1
        "sequence_no": 12,
        "node": 1,
        "foo": "bar",
        "best_pony": "Littlepip"
    }

    def test_Init_unknown_type2_toObject(self):
        self.assertRaises(AssertionError, Message.from_dict, self.data_unknown_type2)
    # end def

    def test_Message_new(self):
        # data is inline
        msg = Message(None, 12, 1)
        self.assertIsInstance(msg, Message)
        self.assertEqual(UNSET, msg.type)
        self.assertEqual(12, msg.sequence_no)
    # end def

    def test_Message_new_toString(self):
        msg = Message(None, 12, 1)
        self.assertEqual("Message(node=1, sequence_no=12, type=0)", str(msg))
    # end def

# end class


if __name__ == '__main__':  # pragma: no cover
    unittest.main()
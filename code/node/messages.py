# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

from .enums import UNSET, INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE, ACKNOWLEDGE

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


class Message(object):
    def __init__(self, type, sequence_no, node):
        if type is None:
            type = UNSET
        # end if
        assert isinstance(type, int)
        self.type = type
        self.sequence_no = sequence_no
        self.node = node  # i


    @classmethod
    def from_dict(cls, data):
        assert "type" in data
        type = data["type"]
        assert type in [UNSET, INIT, LEADER_CHANGE, PROPOSE, PREVOTE, VOTE, ACKNOWLEDGE]
        if type == INIT:
            return InitMessage.from_dict(data)
        # end def
        if type == LEADER_CHANGE: # pragma: no cover
            return LeaderChangeMessage.from_dict(data)
        # end def
        if type == PROPOSE:
            return ProposeMessage.from_dict(data)
        # end def
        if type == PREVOTE:
            return PrevoteMessage.from_dict(data)
        # end def
        if type == VOTE:
            return VoteMessage.from_dict(data)
        # end def
        if type == ACKNOWLEDGE:
            return Acknowledge.from_dict(data)
        # end def
        return cls(**{
            "type": data["type"],
            "sequence_no": data["sequence_no"],
            "node": data["node"]
        })
    # end def

    def to_dict(self):
        return {
            "type": self.type,
            "sequence_no": self.sequence_no,
            "node": self.node
        }
    # end def

    def __str__(self):
        data = self.to_dict()
        return "{class_name}({values})".format(
            class_name=self.__class__.__name__,
            values=", ".join(["{key}={value!r}".format(key=k, value=data[k]) for k in sorted(data)])
        )
# end class


class InitMessage(Message):
    def __init__(self, sequence_no, node, value):
        super(InitMessage, self).__init__(INIT, sequence_no, node)
        self.value = value  # vi
    # end def

    @classmethod
    def from_dict(cls, data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "value": data["value"],
        }
        return cls(**kwargs)
    # end def

    def to_dict(self):
        data = super().to_dict()
        data["value"] = self.value
        return data
    # end def
# end class


class LeaderChangeMessage(Message):  # pragma: no cover
    def __init__(self, sequence_no, node_num, leader, P):
        raise NotImplementedError("LeaderChangeMessage")
        super(LeaderChangeMessage, self).__init__(LEADER_CHANGE, sequence_no)
    # end def

    @classmethod
    def from_dict(cls, data):
        raise NotImplementedError("LeaderChangeMessage")
        kwargs = {
            "type": data["type"],
            "sequence_no": data["sequence_no"],
        }
        return cls(**kwargs)
    # end def

    def to_dict(self):
        raise NotImplementedError("LeaderChangeMessage")
        return {
            "type": self.type,
            "sequence_no": self.sequence_no,
        }
    # end def
# end class


class ProposeMessage(Message):
    def __init__(self, sequence_no, node, leader, proposal, value_store):
        super(ProposeMessage, self).__init__(PROPOSE, sequence_no, node)
        self.leader = leader
        self.proposal = proposal
        assert isinstance(value_store, list)
        self.value_store = value_store

    @classmethod
    def from_dict(cls, data):
        value_store = []
        for v in data.get("value_store", []):
            msg = InitMessage.from_dict(v)
            # value_store[msg.node] = msg
            value_store.append(msg)
        # end for
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data.get("node"),
            "leader": data.get("leader"),
            "proposal": data.get("proposal"),
            "value_store": value_store
        }
        return cls(**kwargs)
    # end def

    def to_dict(self):
        data = super().to_dict()
        data["leader"] = self.leader
        data["proposal"] = self.proposal
        data["value_store"] = [x.to_dict() if hasattr(x, "to_dict") else x for x in self.value_store]
        return data
    # end def
# end class


class PrevoteMessage(Message):
    def __init__(self, sequence_no, node, leader, value):
        super().__init__(PREVOTE, sequence_no, node)
        self.leader = leader
        self.value = value
    # end if

    @classmethod
    def from_dict(cls, data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "leader": data["leader"],
            "value": data["value"],
        }
        return cls(**kwargs)

    # end def

    def to_dict(self):
        data = super().to_dict()
        data["leader"] = self.leader
        data["value"] = self.value
        return data
    # end def
# end class


class VoteMessage(Message):
    def __init__(self, sequence_no, node, leader, value):
        super().__init__(VOTE, sequence_no, node)
        self.leader = leader
        self.value = value
    # end def

    @classmethod
    def from_dict(cls, data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "leader": data["leader"],
            "value": data["value"],
        }
        return cls(**kwargs)
    # end def

    def to_dict(self):
        data = super().to_dict()
        data["leader"] = self.leader
        data["value"] = self.value
        return data
    # end def
# end class


class NewLeaderMessage(Message): # pragma: no cover
    def __init__(self, sequence_no, node, leader, value):
        super().__init__(VOTE, sequence_no, node)
        self.leader = leader
        self.value = value
    # end def
# end class


class Acknowledge(Message):
    def __init__(self, sequence_no, node, sender, raw):
        super().__init__(ACKNOWLEDGE, sequence_no, node)
        self.sender = sender
        self.raw = raw
    # end def

    @classmethod
    def from_dict(cls, data):
        kwargs = {
            "sequence_no": data["sequence_no"],
            "node": data["node"],
            "sender": data["sender"],
            "raw": data["raw"],
        }
        return cls(**kwargs)
    # end def

    def to_dict(self):
        data = super().to_dict()
        data["sender"] = self.sender
        data["raw"] = self.raw
        return data
    # end def
# end class
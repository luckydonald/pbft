# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


def flatten_list(args):
    if isinstance(args, tuple):
        args = list(args)
    elif not isinstance(args, list):
        args = [args]
    # end if
    assert isinstance(args, list)
    new_args = []
    for arg in args:
        if isinstance(arg, (list,tuple)):
            new_args.extend(arg)
        else:
            new_args.append(arg)
    # end if
    return new_args
# end def
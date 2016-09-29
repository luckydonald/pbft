# -*- coding: utf-8 -*-
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)


def flatten_list(args):
    if isinstance(args, tuple):
        classes_or_types = list(args)
    elif not isinstance(args, list):
        classes_or_types = [args]
    # end if
    assert isinstance(args, list)
    new_args = []
    for arg in args:
        if isinstance(new_args, (list,tuple)):
            new_args.extend(arg)
        else:
            new_args.append(arg)
    # end if
    return new_args
# end def
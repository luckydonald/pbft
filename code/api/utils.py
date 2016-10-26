# -*- coding: utf-8 -*-
from flask import request
from luckydonaldUtils.logger import logging

__author__ = 'luckydonald'
logger = logging.getLogger(__name__)

ORIGIN_LIST = "http://localhost:63342", "http://localhost"


def jsonify(data, allow_all_origin=False):
    from flask import Response, jsonify as json_ify
    res = json_ify(data)
    assert isinstance(res, Response)
    origin = request.environ.get('HTTP_ORIGIN')
    if not origin:
        origin = request.environ.get('ORIGIN')
    # end if
    if allow_all_origin:
        res.headers["Access-Control-Allow-Origin"] = '*'
    elif origin and origin in ORIGIN_LIST:
        res.headers["Access-Control-Allow-Origin"] = request.environ['HTTP_ORIGIN']
    # end if
    return res
# end def

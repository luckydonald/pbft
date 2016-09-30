# -*- coding: utf-8 -*-
import inspect

from DictObject import DictObject
from luckydonaldUtils.logger import logging
# from luckydonaldUtils.functions import cached
from luckydonaldUtils.clazzes import Singleton
from docker import Client
from datetime import timedelta, datetime

__author__ = 'luckydonald'

logger = logging.getLogger(__name__)


def cached(max_age=None):
    """
    Cache a function.
    You can specify a max_age (:class:`datetime.timedelta`) after when the function will be called again.

    Note: Only works with jsonable args and kwargs.

    :keyword max_age: timedelta of how long we should keep the cache. None means forever.
    :type    max_age: None or timedelta
    """
    # http://stackoverflow.com/a/30698822/3423324
    # _format = {"returns": "I am a return value!!", "max_age": timedelta(seconds=60), "last_hit": datetime.now()}
    memo = {}
    import json

    def stringify(obj):
        if isinstance(obj, (list, tuple)):
            return repr([stringify(x) for x in obj])
        if isinstance(obj, dict):
            res = {}
            for k, v in obj.items():
                res[k] = stringify(k)
            # end for
            return repr(res)
        try:
            return json.dumps(obj)
        except TypeError:
            return str(repr(obj)) + str(obj) + str(id(obj))
        # end if

    def func_wrapper(function, **decorator_kwargs):
        def wrapper(*args, **kwargs):
            args_key = stringify([args, kwargs])
            now = datetime.now()
            if "max_age" in decorator_kwargs:
                max_age_ = decorator_kwargs["max_age"]
            else:
                max_age_ = max_age
            if (args_key) in memo.keys():
                logger.debug(memo[args_key])
                if not max_age_ or now - memo[args_key]["last_hit"] < memo[args_key]["max_age"]:
                    return memo[args_key]["returns"]
                    # end if
            # end if
            res = function(*args, **kwargs)
            memo[args_key] = {"returns": res, "last_hit": now, "max_age": max_age_}
            return res

        return wrapper

    try:
        is_callable = callable(max_age)
    except (SyntaxError, NameError):
        is_callable = inspect.isfunction(max_age) or inspect.isbuiltin(max_age)
    # end try
    if is_callable:  # max_age was not provided, max_age is actually our function to decorate
        func = max_age
        return func_wrapper(func, max_age=None)
    return func_wrapper  # else: max_age is max_age, we need to return a decorator accepting the function
# end def


class ServiceInfos(object, metaclass=Singleton):
    __author__ = 'luckydonald'
    LABEL_COMPOSE_CONTAINER_NUMBER = 'com.docker.compose.container-number'
    LABEL_COMPOSE_PROJECT = 'com.docker.compose.project'
    LABEL_COMPOSE_SERVICE = 'com.docker.compose.service'
    CACHING_TIME = timedelta(seconds=60)

    @property
    @cached(max_age=CACHING_TIME)
    def cli(self):
        return Client(base_url='unix://var/run/docker.sock')
    # end def

    @property
    @cached(max_age=max(timedelta(hours=1), CACHING_TIME))
    def hostname_env(self):
        import os
        return os.environ.get("HOSTNAME")
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def me(self):
        return [DictObject.objectify(c) for c in self.cli.containers() if c['Id'][:12] == self.hostname_env[:12]][0]
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def id(self):
        return self.me.Id
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def service(self):
        return self.me.Labels[self.LABEL_COMPOSE_SERVICE]
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def name(self):
        return self.service
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def project(self):
        return self.me.Labels[self.LABEL_COMPOSE_PROJECT]
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def number(self):
        return int(self.me.Labels[self.LABEL_COMPOSE_CONTAINER_NUMBER])
    # end def

    @cached(max_age=CACHING_TIME)
    def containers(self, exclude_self=False):
        """
        Gets metadata for all containers in this scale grouping.

        :return:
        """
        filters = [
            '{0}={1}'.format(self.LABEL_COMPOSE_PROJECT, self.project),
            '{0}={1}'.format(self.LABEL_COMPOSE_SERVICE, self.service),
            # '{0}={1}'.format(LABEL_ONE_OFF, "True" if one_off else "False")
        ]
        return DictObject.objectify([
            c for c in self.cli.containers(filters={'label': filters})
            if not (exclude_self and c['Id'][:12] == self.hostname_env[:12])
        ])
    # end def

    @property
    @cached(max_age=CACHING_TIME)
    def hostname(self):
        c = self.me
        return "{project}_{service}_{i}".format(
                project=c.Labels[self.LABEL_COMPOSE_PROJECT],
                service=c.Labels[self.LABEL_COMPOSE_SERVICE],
                i=c.Labels[self.LABEL_COMPOSE_CONTAINER_NUMBER]
        )
    # end def

    @cached(max_age=CACHING_TIME)
    def other_hostnames(self, exclude_self=False):
        return [
            "{project}_{service}_{i}".format(
                project=c.Labels[self.LABEL_COMPOSE_PROJECT],
                service=c.Labels[self.LABEL_COMPOSE_SERVICE],
                i=c.Labels[self.LABEL_COMPOSE_CONTAINER_NUMBER]
            ) for c in self.containers(exclude_self=exclude_self)

        ]
    # end def

    @cached(max_age=CACHING_TIME)
    def other_numbers(self, exclude_self=False):
        return [
            c.Labels[self.LABEL_COMPOSE_CONTAINER_NUMBER]
            for c in self.containers(exclude_self=exclude_self)
        ]
    # end def
# end class
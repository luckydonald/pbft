# -*- coding: utf-8 -*-

from DictObject import DictObject
from luckydonaldUtils.logger import logging
from luckydonaldUtils.functions import cached
from luckydonaldUtils.clazzes import Singleton
from docker import Client
from datetime import timedelta

__author__ = 'luckydonald'

logger = logging.getLogger(__name__)


class ServiceInfos(object, metaclass=Singleton):
    """
    Infos about a `docker-compose scale` group.
    """
    __author__ = 'luckydonald'
    LABEL_COMPOSE_CONTAINER_NUMBER = 'com.docker.compose.container-number'
    LABEL_COMPOSE_PROJECT = 'com.docker.compose.project'
    LABEL_COMPOSE_SERVICE = 'com.docker.compose.service'
    CACHING_TIME = timedelta(seconds=5)

    def __init__(self, caching_time=None):
        """
        Infos about a `docker-compose scale` group.

        If caching_time is not specified, the $DOCKER_CACHING_TIME environment variable will be used.
        If that is empty, too, it will fallback to the default CACHING_TIME of 5 seconds.

        :param caching_time: must be a datetime.timedelta object
        """
        if caching_time:
            assert isinstance(caching_time, timedelta)
            self.CACHING_TIME = caching_time
        else:
            import os
            timedelta(seconds=float(os.environ.get("DOCKER_CACHING_TIME", ServiceInfos.CACHING_TIME.total_seconds())))
        # end if
    # end def

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
        """
        :param exclude_self:
        :return:
        """
        return [
            c.Labels[self.LABEL_COMPOSE_CONTAINER_NUMBER]
            for c in self.containers(exclude_self=exclude_self)
        ]
    # end def
# end class

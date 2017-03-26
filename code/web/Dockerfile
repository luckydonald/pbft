FROM node
EXPOSE 8000

# Code Dir
RUN mkdir -p /app/code
WORKDIR /app/

# Node lib dir
RUN npm config set prefix /app/libs

#RUN echo $PATH
ENV PATH /app/libs/bin:$PATH
RUN echo $PATH

# code install
RUN npm install -g bower
RUN npm install -g http-server

ADD package.json /app

# Bower install
ADD .bowerrc /app
ADD bower.json /app
RUN bower install --allow-root

ADD ./src /app/src
ADD ./example /app/example
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
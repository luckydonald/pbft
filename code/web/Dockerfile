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
ENTRYPOINT ["http-server", "-p", "8000", "-c-1"]
CMD ["/app/"]
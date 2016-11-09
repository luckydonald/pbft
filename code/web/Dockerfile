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
ADD package.json /app
ADD bower.json /app
ADD .bowerrc /app
# RUN npm config set prefix /libs && npm install -g bower && npm install -g && which bower
#RUN npm install -g || /app/code/npm-debug.log
RUN npm install -g
RUN npm install -g bower
RUN ls /app/libs/
RUN ls /app/libs/bin/

RUN which npm
RUN which bower
RUN bower install --allow-root
RUN ls -la

ADD ./src /app/src
RUN npm install
CMD [ "npm", "start" ]
# CMD ["sleep 12312312312312312312"]
CMD [ "node_modules/http-server/bin/http-server", "-p", "8000", "-c-1", "/app/src"]
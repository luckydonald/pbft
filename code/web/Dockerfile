FROM node
EXPOSE 8000

RUN mkdir /code
WORKDIR /code

ADD package.json /code
ADD bower.json /code
ADD .bowerrc /code
RUN npm install

ADD ./src /code/
CMD [ "npm", "start" ]
#CMD [ "http-server", "-a", "localhost", "-p", "8000", "-c-1", "/code"]
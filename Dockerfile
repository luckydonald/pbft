FROM python:3.5

# dependencies:
RUN mkdir /code
WORKDIR /code/

# libs
RUN mkdir /code/libs/
ADD ./extras/libs/ /code/libs
ADD ./requirements.txt /code
RUN pip install -r requirements.txt
RUN rm requirements.txt
# dependencies done

# our code:
WORKDIR /code/
ADD ./code /code/

# defaults for running it
ENTRYPOINT ["python"]
CMD ["main.py"]

FROM tiangolo/uwsgi-nginx-flask:flask-python3.5

RUN mkdir -p /app/code
WORKDIR /app/
COPY ./code/api/requirements.txt /app/
RUN pip install -r requirements.txt
RUN rm requirements.txt
COPY ./code /app
COPY ./code/api/uwsgi.ini /app/uwsgi.ini

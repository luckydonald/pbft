FROM tiangolo/uwsgi-nginx-flask:flask-python3.5

RUN mkdir -p /app/code
WORKDIR /app/
COPY requirements.txt /app/
RUN pip install -r requirements.txt
RUN rm requirements.txt
COPY . /app

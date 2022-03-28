FROM python:3.8

COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt
ENV PYTHONPATH=/app/src/

EXPOSE 7000

CMD make run-cypress-local

FROM python:3.7

ADD . /app
WORKDIR /app
RUN pip install -r requirements.txt
ENV PYTHONPATH=/app/src/

EXPOSE 7001

CMD ["make", "run-async-local"]

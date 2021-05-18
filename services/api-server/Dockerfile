FROM python:3.7

COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt
ENV PYTHONPATH=/app/src/

EXPOSE 7000

CMD ["make", "run-local-cypress"]

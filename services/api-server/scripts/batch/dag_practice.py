from dagster import pipeline, solid
from dagster import execute_pipeline

@solid
def get_name():
    return "dagster"


@solid
def hello(context, name):
    context.log.info(f"Hello, {name}!")


@pipeline
def hello_pipeline():
    hello(get_name())

if __name__ == "__main__":
    execute_pipeline(hello_pipeline)
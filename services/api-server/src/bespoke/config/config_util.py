def is_test_env(flask_env: str) -> bool:
	return flask_env == 'test'

def is_development_env(flask_env: str) -> bool:
	return flask_env == 'development'

def is_prod_env(flask_env: str) -> bool:
	return flask_env == 'production'

"""
	triggers_fast.py handles quick async tasks that happen outside of the webserver

	These tasks should take no longer than 1 - 2 seconds, and hence
	are the "fast" triggers.
"""
from server.views import shared_triggers
from flask import Blueprint

handler = Blueprint('triggers_fast', __name__)

shared_triggers.add_shared_handlers(handler)

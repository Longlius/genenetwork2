from __future__ import absolute_import, division, print_function

import sys
print("sys.path is:", sys.path)

from flask import Flask

from utility import formatting

app = Flask(__name__)

# See http://flask.pocoo.org/docs/config/#configuring-from-files
app.config.from_object('cfg.default_settings')
app.config.from_envvar('WQFLASK_SETTINGS')

app.jinja_env.globals.update(
    numify = formatting.numify
)

import wqflask.views

from flask import render_template
from flask import request

import time
import flask
from flask import Flask
app = Flask(__name__)

import requests

@app.route('/', methods=("GET", "POST", "OPTIONS"))
def index():
  qs=request.query_string

  if qs:
    try:
      qs = qs.decode('utf8')
      return str(qs)

    except:
      return "nope"

  return render_template('index.html')


from flask import render_template
from flask import request

import time
import flask
from flask import Flask
app = Flask(__name__)

import os
import requests

@app.route('/', methods=("GET", "POST", "OPTIONS"))
def index():
  verify=request.args.get("verify")

  if verify:
    try:
      return str("trying to verify "+str(user))

    except:
      return "nope"

  return render_template('index.html')


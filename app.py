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

  user=request.args.get("verify")
  if user:
    try:
      output='<pre>\n'
      output+="trying to vefriy "+str(user)+"\n"
      output+="MOTD is "+os.environ['MOTD']+'\n'

      output+="\n<\pre>"
      return output

    except:
      return "nope"

  return render_template('index.html')


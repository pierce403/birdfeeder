from flask import render_template
from flask import request

import time
import flask
from flask import Flask
app = Flask(__name__,static_url_path='/static')

import os
import requests
import tweepy as tw

from flask import send_from_directory

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, '/static'),
                          'favicon.ico',mimetype='image/vnd.microsoft.icon')

@app.route('/', methods=("GET", "POST", "OPTIONS"))
def index():

  user=request.args.get("verify")
  if user:
    try:
      output='<pre>\n'
      output+="trying to vefriy "+str(user)+"\n"
      output+="MOTD is "+os.environ['MOTD']+'\n'

      auth = tw.OAuthHandler(os.environ['consumer_key'], os.environ['consumer_secret'])
      auth.set_access_token(os.environ['access_token'], os.environ['access_token_secret'])
      api = tw.API(auth)
      user = api.get_user(screen_name=user)

      output+="user id is "+str(user.id)+'\n'
      output+="they have "+str(user.followers_count)+" followers\n"

      output+="\n</pre>"
      return output

    except:
      return "nope"

  return render_template('index.html')


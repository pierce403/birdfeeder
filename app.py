from flask import render_template
from flask import request

import time
import flask
from flask import Flask
from flask_sslify import SSLify

app = Flask(__name__,static_url_path='/static')
sslify = SSLify(app)

import os
import requests
import tweepy as tw

from flask import send_from_directory

from web3 import Web3, HTTPProvider
import time


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                          'favicon.ico',mimetype='image/vnd.microsoft.icon')

@app.route('/', methods=("GET", "POST", "OPTIONS"))
def index():

  user=request.args.get("verify")
  if user:
    try:
      output='<pre>\n'
      output+="trying to verify "+str(user)+"\n"
      output+="MOTD is "+os.environ['MOTD']+'\n'

      auth = tw.OAuthHandler(os.environ['consumer_key'], os.environ['consumer_secret'])
      auth.set_access_token(os.environ['access_token'], os.environ['access_token_secret'])
      api = tw.API(auth)
      user = api.get_user(screen_name=user)

      output+="user id is "+str(user.id)+'\n'
      output+="you have "+str(user.followers_count)+" followers\n"

      if int(user.followers_count) < 100:
        output+="hmm, you should get more followers"
        return output+"/n</pre>"

      try:
        tweet = api.user_timeline(id = user, count = 1)[0].text
        output += tweet+'\n'
        output += "got tweet\n"
        offset = tweet.find('0x')
        if(offset>0):
          addr = tweet[offset:offset+42]
        output += "address looks like "+addr+"\n"
        dispense(addr, user.id)
        output += "ETH sent maybe!\n"
      except:
        output += "reading tweet failed\n"    

      output+="\n</pre>"
      return output

    except Exception as e:
      return "nope "+str(e)

  return render_template('index.html')

def dispense(dest, uid):

  w3 = Web3(HTTPProvider(os.environ['web3']))

  wallet_private_key = os.environ['KEY']

  abistring = '''[{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"sum","type":"uint256"},{"name":"userid","type":"uint256"}],"name":"dispense","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contributors","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lowest","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"lowestAmount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"paid","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"top8","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}]'''

  birdFeeder = w3.eth.contract(address='0xD803d7597bd638998BE368aF196DC2c53cAF5B63',abi=abistring)
  nonce = w3.eth.getTransactionCount("0xe6898aFEc66515349De48C7AC90e26D93d128C66")
  balance = w3.eth.getBalance("0xD803d7597bd638998BE368aF196DC2c53cAF5B63")

  txn_dict = birdFeeder.functions.dispense(dest,int(balance/100),uid).buildTransaction({
    'chainId': 1,
    'gas': 140000,
    'gasPrice': w3.toWei('20', 'gwei'),
    'nonce': nonce,
  })

  signed_txn = w3.eth.account.signTransaction(txn_dict, private_key=wallet_private_key)
  result = w3.eth.sendRawTransaction(signed_txn.rawTransaction)
  tx_receipt = w3.eth.getTransactionReceipt(result)


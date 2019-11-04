from flask import *
import sqlite3
import os
import models as dbHandler
import socket
from websocketSV import startWS
import threading
import asyncio
import json
app = Flask(__name__)
app.secret_key = 'alo'


class User():
    def __init__(self, id, name, avatar):
        self.id = id
        self.name = name
        self.avatar = avatar


@app.route("/")
def index():
    return render_template("signin.html")


@app.route("/test")
def index2():
    return render_template("index2.html")


@app.route("/signinPage")
def signinPage():
    return render_template("signin.html")


@app.route("/signupPage")
def signupPage():
    return render_template("index.html")

@app.route("/logout")
def logout():
    session.clear()
    return render_template("signin.html")

@app.route("/signup", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        name = request.form['name']
        password = request.form['password']
        dbHandler.signup(name, password)
        id = dbHandler.getId(name)
        avatar = dbHandler.getAvatar(name)
        session['user'] = User(id, name, avatar).__dict__
        session['name']=name
    return redirect(url_for('mainPage',name=name))

@app.route("/main")
def mainPage():
    name=request.args.get('name')
    # id = dbHandler.getId(name)
    # avatar = dbHandler.getAvatar(name)
    # session['user'] = User(id, name, avatar).__dict__
    # # session['name']=name
    if 'name' in session and session['name']==name:
        return render_template("messages.html")
    else:
        abort(404)

@app.route("/signin", methods=["POST", "GET"])
def signin():
    if request.method == "POST":
        name = request.form['name']
        password = request.form['password']
        if(dbHandler.signin(name, password)):
            id = dbHandler.getId(name)
            avatar = dbHandler.getAvatar(name)
            session['user'] = User(id, name, avatar).__dict__
            session['name']=name
            return redirect(url_for('mainPage',name=name))
        else:
            return render_template("signin.html")

@app.route("/search")
def search():
        search_input=request.args.get('search-input')
        myname=request.args.get('myname')
        searchDict=dbHandler.searchUser(search_input,myname)
        json_data1=json.dumps(searchDict)
        json_data=json.loads(json_data1)
        return jsonify(json_data)

@app.route("/addContact")
def addContact():
    cname=request.args.get('cname')
    myname=request.args.get('name')
    dbHandler.addContact(myname,cname)
    return jsonify(cname=cname)

@app.route("/checkname")
def check():
    name=request.args.get('name')
    if str(name)==str():
         return "True"
    return str(dbHandler.checkUserName(name))

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'),404

@app.context_processor
def utility_processor():
    def contactList(name):
        contact=dbHandler.listContact(name)
        json_data1=json.dumps(contact)
        json_data=json.loads(json_data1)
        return contact
    return dict(contactList=contactList)

def flaskThread():
    addr = socket.gethostbyname(socket.gethostname())
    app.run(host=addr)


def websocketThread():
    startWS()


if __name__ == "__main__":
    fskThread = threading.Thread(target=flaskThread)
    wsThread = threading.Thread(target=websocketThread)
    fskThread.start()
    wsThread.start()

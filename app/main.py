from flask import *
import sqlite3
import os
import models as dbHandler
import socket
from websocketSV import startWS
import threading
import asyncio
app = Flask(__name__)
app.secret_key = 'alo'


class User():
    def __init__(self, id, name, avatar):
        self.id = id
        self.name = name
        self.avatar = avatar


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/test")
def index2():
    return render_template("index2.html")


@app.route("/signinPage")
def signinPage():
    return render_template("signin.html")


@app.route("/signupPage")
def signupPage():
    return render_template("index.html")


@app.route("/signup", methods=["POST", "GET"])
def signup():
    if request.method == "POST":
        name = request.form['name']
        password = request.form['password']
        dbHandler.signup(name, password)
        id = dbHandler.getId(name)
        avatar = dbHandler.getAvatar(name)
        session['user'] = User(id, name, avatar).__dict__
    return render_template("messages.html")


@app.route("/signin", methods=["POST", "GET"])
def signin():
    if request.method == "POST":
        name = request.form['name']
        password = request.form['password']
        if(dbHandler.signin(name, password)):
            id = dbHandler.getId(name)
            avatar = dbHandler.getAvatar(name)
            session['user'] = User(id, name, avatar).__dict__
            return render_template("messages.html")
        else:
            return render_template("signin.html")


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

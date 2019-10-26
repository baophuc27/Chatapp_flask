from flask import *
import sqlite3
import os
import models as dbHandler

template_dir=os.path.abspath("../templates")
static_dir=os.path.abspath("/static")

app=Flask(__name__,template_folder=template_dir,static_url_path="/static")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/signinPage")
def signinPage():
        return render_template("signin.html")

@app.route("/signupPage")
def signupPage():
    return render_template("index.html")

@app.route("/signup",methods=["POST","GET"])
def signup():
    
            name=request.form['name']
            password=request.form['password']
            print((name,password))
            dbHandler.signup(name,password)
            return render_template("messages.html")

@app.route("/signin",methods=["POST","GET"])
def signin():
            name=request.form['name']
            password=request.form['password']
            if(dbHandler.signin(name,password)):
                session
                return render_template("messages.html")
            else:
                return render_template("signin.html")

if __name__=="__main__":
    app.run(debug=True)




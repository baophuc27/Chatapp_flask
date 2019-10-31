import os
import sqlite3

user_database=os.path.abspath("data/user.db")

def signup(name,password):
    avatar="https://imgur.com/jUmCAZj"
    try:
        with sqlite3.connect(user_database) as con:
                cur=con.cursor()
                cur.execute("INSERT INTO USERS(name,password,avatar) VALUES(?,?,?);",(name,password,avatar))
                con.commit()
    except:
        con.rollback()
    finally:
        con.close

def signin(name,password):
    query="SELECT * FROM USERS WHERE name=\""+name+"\" AND password="+password+";"
    try:
        with sqlite3.connect(user_database) as con:
            cur=con.cursor()
            cur.execute(query)         
            con.commit()
    except:
        con.rollback()
    finally:
        con.close
    if cur.fetchone():
        return True
    else: 
        return False

def getAvatar(name):
    query="SELECT avatar FROM USERS WHERE USERS.name=\""+name+"\";"
    try:
        with sqlite3.connect(user_database) as con:
            cur=con.cursor()
            cur.execute(query)
            con.commit()
            avatar=cur.fetchone()
    except:
        con.rollback()
    finally:

        con.close()
        return avatar


def getId(name):
    query="SELECT id FROM USERS WHERE USERS.name=\""+name+"\";"
    try:
        with sqlite3.connect(user_database) as con:
            cur=con.cursor()
            cur.execute(query)
            con.commit()
            id=cur.fetchone()
    except:
        con.rollback()
    finally:
        con.close()
    return id
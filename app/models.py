import os
import sqlite3

user_database=os.path.abspath("data/user.db")

def signup(name,password):
    try:
        with sqlite3.connect(user_database) as con:
                cur=con.cursor()
                cur.execute("INSERT INTO USERS(name,password) VALUES(?,?);",(name,password))
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

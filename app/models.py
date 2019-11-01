import os
import sqlite3
from operator import itemgetter

user_database=os.path.abspath("data/user.db")

def signup(name,password):
    avatar="https://i.imgur.com/jUmCAZj.jpg"
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
        return avatar[0]


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
    return id[0]

def searchUser(name,myname):
    splitName="%"+'%'.join(x for x in name)+"%"
    query="SELECT id,name,avatar FROM USERS WHERE USERS.name like \""+splitName+"\" AND name != \""+myname+"\" EXCEPT SELECT DISTINCT USERS.id,USERS.name,USERS.avatar from CONTACTS JOIN USERS on CONTACTS.cname=USERS.name WHERE CONTACTS.myname=\""+myname+"\""
    res=dict()
    try:
        with sqlite3.connect(user_database) as con:
            cur=con.cursor()
            cur.execute(query)
            con.commit()
            res=cur.fetchall()
    except:
        con.rollback()
    finally:
        con.close()
    idList=list()
    nameList=list()
    avatarList=list()
    for i in res:
        idList+=[i[0]]
        nameList+=[i[1]]
        avatarList+=[i[2]]
    Dict={'id':idList,'name':nameList,'avatar':avatarList}
    resDict=[{'id':i,'name':n,'avatar':a} for i,n,a in zip(Dict['id'],Dict['name'],Dict['avatar'])]
    return resDict

def addContact(myname,cname):
    query="INSERT INTO CONTACTS(myname,cname) VALUES(\""+myname +"\",\""+cname+"\");"
    try:
        with sqlite3.connect(user_database) as con:
            cur=con.cursor()
            cur.execute(query)
            con.commit()
    except:
        con.rollback()
    finally:
        con.close()

def listContact(name):
    query="SELECT DISTINCT USERS.id,name,avatar FROM USERS JOIN CONTACTS ON USERS.name=CONTACTS.cname AND CONTACTS.myname=\'"+name+"\';"
    try:
        with sqlite3.connect(user_database) as con:
            cur=con.cursor()
            cur.execute(query)
            con.commit()
            res=cur.fetchall()
    except:
        con.rollback()
    finally:
        con.close()
    idList=list()
    nameList=list()
    avatarList=list()
    for i in res:
        idList+=[i[0]]
        nameList+=[i[1]]
        avatarList+=[i[2]]
    Dict={'id':idList,'name':nameList,'avatar':avatarList}
    resDict=[{'id':i,'name':n,'avatar':a} for i,n,a in zip(Dict['id'],Dict['name'],Dict['avatar'])]
    return resDict

def checkUserName(name):
    query="SELECT * FROM USERS WHERE name=\""+name+"\";"
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

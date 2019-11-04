import sqlite3
conn=sqlite3.connect("../data/user.db")
# conn.execute("create table USERS(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL UNIQUE,password TEXT NOT NULL, avatar TEXT);")
conn.execute("create table CONTACTS(id INTEGER PRIMARY KEY AUTOINCREMENT,myname TEXT NOT NULL,cname TEXT NOT NULL)")

import sqlite3
conn=sqlite3.connect("../data/user.db")
conn.execute("create table USERS(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL UNIQUE,password TEXT NOT NULL, avatar TEXT);")
conn.execute("create table CONTACTS(cid INTEGER PRIMARY KEY AUTOINCREMENT, my_id INTEGER, contact_id INTEGER);")
conn.close()

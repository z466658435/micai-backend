import mysql from "mysql"
import { db_user, db_host, db_password, db_database } from "./config.js"

export const db = mysql.createConnection({
  host: db_host,
  user: db_user,
  password: db_password,
  database: db_database
})
var ifcreate_invitecode = 1

function createTable (tableName, createSQL) {
  return new Promise((resolve, reject) => {
    const checkTableExists = `SHOW TABLES LIKE '${tableName}'`

    db.query(checkTableExists, function (err, result) {
      if (err) {
        reject(err)
        return
      }

      if (result.length === 0) {
        // 表不存在，创建表
        db.query(createSQL, function (err, result) {
          if (err) {
            reject(err)
          } else {
            console.log(`表 ${tableName} 创建成功！`)
            resolve()
          }
        })
      } else {
        // console.log(`表 ${tableName} 已经存在`)
        if (tableName == 'invitecode') ifcreate_invitecode = 0
        resolve()
      }
    })
  })
}

db.connect(async function (err) {
  if (err) throw err
  console.log("数据库已连接！！！~~~")

  // 检查并创建表

  // 用户user     UNIQUE KEY (uuid):添加唯一索引 使得post表可以创建外键
  createTable("user", `CREATE TABLE user (
      id INT PRIMARY KEY AUTO_INCREMENT,
      uuid CHAR(36) NOT NULL,
      username VARCHAR(40) NOT NULL,
      password VARCHAR(255) NOT NULL,
      img VARCHAR(255) DEFAULT NULL,
      name VARCHAR(60) DEFAULT NULL,
      gender ENUM('0', '1') DEFAULT NULL,
      date DATE DEFAULT '2000-01-01',
      nativePlace VARCHAR(30) DEFAULT NULL,
      college VARCHAR(60) DEFAULT NULL,
      major VARCHAR(60) DEFAULT NULL,
      QQnumber VARCHAR(30) DEFAULT NULL,
      serviceTime INT DEFAULT NULL,
      servicePlace VARCHAR(30) DEFAULT NULL,
      station VARCHAR(30) DEFAULT NULL,
      services VARCHAR(30) DEFAULT NULL,
      UNIQUE KEY (uuid) 
      )`)

  // 照片墙photo
  createTable("photo", `CREATE TABLE photo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid CHAR(36) NOT NULL,
    img VARCHAR(255) DEFAULT NULL,
    username VARCHAR(40) NOT NULL,
    name VARCHAR(60) DEFAULT NULL,
    createdate DATETIME DEFAULT NULL,
    FOREIGN KEY (user_uuid) REFERENCES user(uuid) ON DELETE CASCADE
    )`)

  // 管理员admin
  createTable("admin", `CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid CHAR(36) NOT NULL,
    username VARCHAR(40) NOT NULL,
    name VARCHAR(60) DEFAULT NULL,
    become_date DATETIME DEFAULT NULL,
    FOREIGN KEY (user_uuid) REFERENCES user(uuid) ON DELETE CASCADE
    )`)

  // 日志record
  createTable("record", `CREATE TABLE record (
    id INT PRIMARY KEY AUTO_INCREMENT,
    operation TEXT,
    resource_id INT NOT NULL,
    IP_address VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    user VARCHAR(60) DEFAULT NULL,
    access VARCHAR(60),
    user_id INT NOT NULL,
    operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

  // 流量统计statistic
  createTable("statistic", `CREATE TABLE statistic (
    id INT PRIMARY KEY AUTO_INCREMENT,
    IP_address VARCHAR(255) NOT NULL,
    count INT DEFAULT 0,
    record_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

  // 黑名单banlist
  createTable("banlist", `CREATE TABLE banlist (
      id INT PRIMARY KEY AUTO_INCREMENT,
      IP_address VARCHAR(255) NOT NULL,
      ban_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`)

  // 邀请码invitecode
  await createTable("invitecode", `CREATE TABLE invitecode (
      id INT PRIMARY KEY AUTO_INCREMENT,
      code VARCHAR(255) NOT NULL,
      state ENUM('used', 'unused') DEFAULT 'unused',
      activate_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

  // 文章post
  createTable("post", `CREATE TABLE post (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_uuid CHAR(36) NOT NULL,
      title VARCHAR(255) DEFAULT NULL,
      content TEXT DEFAULT NULL,
      img VARCHAR(255) NOT NULL,
      category VARCHAR(45) NOT NULL,
      readings INT DEFAULT 0,
      likes JSON,
      comments JSON,
      post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_uuid) REFERENCES user(uuid) ON DELETE CASCADE
    );`)

  // 评论comment
  createTable("comment", `CREATE TABLE comment (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_uuid CHAR(36) NOT NULL,
      post_id INT NOT NULL,
      comment_content TEXT DEFAULT NULL,
      comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE)`)

  // 子评论（评论的评论）comment_child
  createTable("comment_child", `CREATE TABLE comment_child (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_uuid CHAR(36) NOT NULL,
      post_id INT NOT NULL,
      father_comment_id INT NOT NULL,
      reply_to_id INT DEFAULT -1,
      comment_content TEXT DEFAULT NULL,
      comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES post(id)ON DELETE CASCADE,
      FOREIGN KEY (father_comment_id) REFERENCES comment(id)ON DELETE CASCADE)`)

  //邮箱（用于注册、找回密码的验证码）email
  createTable("email", `CREATE TABLE email (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(255) NOT NULL,
      email_code INT NOT NULL,
      overdue_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`)

  //初始化一条邀请码invitecode数据 用于第一个用户的创建
  if (ifcreate_invitecode == 1) {
    const invitecode_init = 'INSERT INTO invitecode (`code`,`state`) VALUES(?) '
    const values = [
      "a",
      "unused",
    ]
    db.query(invitecode_init, [values], (err, data) => {
      if (err) {
        console.log(err)
      }
      console.log("邀请码invitecode初始化一条数据成功！")
    })
  }
})
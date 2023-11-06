import mysql from "mysql"

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jintong246",
  database: "micai"
})

db.connect(function (err) {
  if (err) throw err
  console.log("数据库已连接！！！~~~")
})

// 用户 ：id uuid 账号 密码 头像 姓名 性别 出生日期 籍贯 学院 专业 QQ号码 年限 地点 岗位 军种
// const sql = `CREATE TABLE user (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   uuid CHAR(36) NOT NULL,
//   username VARCHAR(40) NOT NULL,
//   password VARCHAR(255) NOT NULL,
//   img VARCHAR(255) DEFAULT NULL,
//   name VARCHAR(60) DEFAULT NULL,
//   gender ENUM('0', '1') DEFAULT NULL,
//   date DATE DEFAULT NULL,
//   nativePlace VARCHAR(30) DEFAULT NULL,
//   college VARCHAR(60) DEFAULT NULL,
//   major VARCHAR(60) DEFAULT NULL,
//   QQnumber VARCHAR(30) DEFAULT NULL,
//   serviceTime INT DEFAULT NULL,
//   servicePlace VARCHAR(30) DEFAULT NULL,
//   station VARCHAR(30) DEFAULT NULL,
//   services VARCHAR(30) DEFAULT NULL,
//   UNIQUE KEY (uuid) // 这里添加唯一索引 使得post表可以创建外键
//   )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 照片墙：id uuid 文件名 用户名 用户姓名 创建日期
// const sql = `CREATE TABLE photo (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   user_uuid CHAR(36) NOT NULL,
//   img VARCHAR(255) DEFAULT NULL,
//   username VARCHAR(40) NOT NULL,
//   name VARCHAR(60) DEFAULT NULL,
//   createdate DATETIME DEFAULT NULL
//   )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 管理员admin
// const sql = `CREATE TABLE admin (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   user_uuid CHAR(36) NOT NULL,
//   username VARCHAR(40) NOT NULL,
//   name VARCHAR(60) DEFAULT NULL,
//   become_date DATETIME DEFAULT NULL
//   )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

//日志record
// const sql = `CREATE TABLE record (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   operation TEXT,
//   resource_id INT NOT NULL,
//   IP_address VARCHAR(255) NOT NULL,
//   region VARCHAR(255),
//   user VARCHAR(60) DEFAULT NULL,
//   access VARCHAR(60),
//   user_id INT NOT NULL,
//   operation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 流量统计statistic
// const sql = `CREATE TABLE statistic (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   IP_address VARCHAR(255) NOT NULL,
//   count INT DEFAULT 0,
//   record_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 黑名单banlist
// const sql = `CREATE TABLE banlist (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   IP_address VARCHAR(255) NOT NULL,
//   ban_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//   )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 邀请码invitecode
//  const sql = `CREATE TABLE invitecode (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   code VARCHAR(255) NOT NULL,
//   state ENUM('used', 'unused') DEFAULT 'unused',
//   activate_time TIMESTAMP DEFAULT NULL
// )`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 文章post
// const sql = `CREATE TABLE post (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   user_uuid CHAR(36) NOT NULL,
//   title VARCHAR(255) DEFAULT NULL,
//   content TEXT DEFAULT NULL,
//   img VARCHAR(255) NOT NULL,
//   category VARCHAR(45) NOT NULL,
//   readings INT DEFAULT 0,
//   likes JSON,
//   comments JSON,
//   post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_uuid) REFERENCES user(uuid) ON DELETE CASCADE
// );`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 评论comment
// const sql = `CREATE TABLE comment (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   user_uuid CHAR(36) NOT NULL,
//   post_id INT NOT NULL,
//   comment_content TEXT DEFAULT NULL,
//   comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE)`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 子评论（评论的评论）comment_child
// const sql = `CREATE TABLE comment_child (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   user_uuid CHAR(36) NOT NULL,
//   post_id INT NOT NULL,
//   father_comment_id INT NOT NULL,
//   reply_to_id INT DEFAULT -1,
//   comment_content TEXT DEFAULT NULL,
//   comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (post_id) REFERENCES post(id)ON DELETE CASCADE,
//   FOREIGN KEY (father_comment_id) REFERENCES comment(id)ON DELETE CASCADE)`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

// 邮箱（用于注册、找回密码的验证码）email    
// const sql = `CREATE TABLE email (
//   id INT PRIMARY KEY AUTO_INCREMENT,
//   username VARCHAR(255) NOT NULL,
//   email_code INT NOT NULL,
//   overdue_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );`
// db.query(sql, function (err, result) {
//   if (err) throw err
//   console.log("Table created")
// })

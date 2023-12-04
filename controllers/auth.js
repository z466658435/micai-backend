import { db } from "../db.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import geoip from 'geoip-lite'
import nodemailer from "nodemailer"
import {email_authorize_code,email_username} from "../config.js"



//发送邮件（注册及修改密码模块）
const transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: email_username,
    pass: email_authorize_code,
  },
})

const randomSixDigitNumber = () => {
  const min = 100000 // 最小的六位数
  const max = 999999 // 最大的六位数
  return Math.floor(Math.random() * (max - min + 1)) + min
}

//发邮件
export const email = async (req, res) => {
  const emailAddress = req.params.emailAddress
  const randomCode = randomSixDigitNumber()
  console.log(emailAddress)
  console.log(randomCode)
  try {
    const info = await transporter.sendMail({
      from: `"南京工业大学迷彩协会" <2485436383@qq.com>`, // sender address
      to: `${emailAddress}`, // list of receivers
      subject: "南京工业大学迷彩协会 验证码", // Subject line 主题
      text: `您的验证码为：${randomCode}`, // plain text body
      html: `<b>您的验证码为：${randomCode}</b>`, // html body
    })
    console.log("Message sent: %s", info.messageId)
    const values = [
      emailAddress,
      randomCode,
      new Date(Date.now() + 3 * 60 * 1000)//3分钟后验证码逾期
    ]
    const q = "INSERT INTO email(`username`,`email_code`,`overdue_time`) VALUES(?)"
    db.query(q, [values], (err, data) => {
      if (err) {
        console.log(err)
        return res.status(404).json(err)
      }
      return res.status(200).json("发送成功")
    })
  } catch (err) {
    console.log(err)
    return res.status(404).json(err)
  }
}

//注册
export const register = (req, res) => {
  console.log(req.body)
  const q = "SELECT * FROM user WHERE username=?"
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err)
    if (!req.body.invitecode) return res.status(400).json('请联系管理员索要邀请码')
    if (!req.body.username || !req.body.password) return res.status(400).json('输入有误，请重新输入')
    if (data.length) return res.status(409).json('用户已存在，创建失败')
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(req.body.password, salt)

    const q = "SELECT * FROM invitecode WHERE code=?"
    db.query(q, [req.body.invitecode], (err, data) => {
      if (err) return res.json(err)
      console.log(333)
      console.log(data)
      if (data.length == 0) return res.status(409).json('邀请码无效')


      const q = "SELECT * FROM email WHERE email_code=? AND username=?"
      db.query(q, [req.body.emailcode, req.body.username], (err, data) => {
        if (err) return res.json(err)
        console.log(444)
        if (data.length == 0) return res.status(409).json('验证码无效')

        //db.beginTransaction 用于启动一个事务，db.commit 用于提交事务，db.rollback 用于回滚事务（如果出现错误）。这确保了如果其中一个查询失败，整个事务都将回滚，不会产生不一致的数据。如果所有查询都成功，事务将被提交。
        db.beginTransaction(function (err) {
          if (err) {
            throw err
          }

          const q = `DELETE FROM email WHERE id = ?`
          db.query(q, [data[0].id], (err, data) => {
            if (err) {
              return db.rollback(function () {
                throw err
              })
            }

            const state = "used"
            const activate_time = new Date()
            const q = "UPDATE invitecode SET state=?,activate_time=? WHERE code=?"
            db.query(q, [state, activate_time, req.body.invitecode], (err, data0) => {
              if (err) {
                return db.rollback(function () {
                  throw err
                })
              }

              const values = [
                req.body.uuid,
                req.body.username,
                hash,
                req.body.img,
              ]
              const q = "INSERT INTO user(`uuid`,`username`,`password`,`img`)VALUES(?)"
              db.query(q, [values], (err, data) => {
                if (err) {
                  return db.rollback(function () {
                    throw err
                  })
                }

                const q = "SELECT id FROM user WHERE uuid=?"
                db.query(q, [req.body.uuid], (err, data0) => {
                  const recordinputs = {
                    operation: "Register新用户注册",
                    resource_id: data0[0].id,
                    region: "江苏 南京",
                    user: '新用户',
                    access: "普通用户",
                    user_id: data0[0].id
                  }

                  db.commit(function (err) {
                    if (err) {
                      return db.rollback(function () {
                        throw err
                      })
                    }
                    return res.status(200).json(recordinputs)
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

//修改密码
export const modify_password = (req, res) => {
  console.log(req.body)
  const q = "SELECT * FROM user WHERE username=?"
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(err)
    if (!req.body.username || !req.body.password) return res.status(400).json('输入有误，请重新输入')
    if (!data.length) return res.status(409).json('用户不存在，修改失败')
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(req.body.password, salt)
    const user_id = data[0].id

    const q = "SELECT * FROM email WHERE email_code=? AND username=?"
    db.query(q, [req.body.emailcode, req.body.username], (err, data1) => {
      if (err) return res.json(err)
      console.log(444)
      if (data1.length == 0) return res.status(409).json('验证码无效')

      //db.beginTransaction 用于启动一个事务，db.commit 用于提交事务，db.rollback 用于回滚事务（如果出现错误）。这确保了如果其中一个查询失败，整个事务都将回滚，不会产生不一致的数据。如果所有查询都成功，事务将被提交。
      db.beginTransaction(function (err) {
        if (err) {
          throw err
        }

        const q = `DELETE FROM email WHERE id = ?`
        db.query(q, [data1[0].id], (err, data2) => {
          if (err) {
            return db.rollback(function () {
              throw err
            })
          }

          const q = "UPDATE user SET password=? WHERE username=?"
          db.query(q, [hash, req.body.username], (err, data3) => {
            if (err) {
              return db.rollback(function () {
                throw err
              })
            }
            db.commit(function (err) {
              if (err) {
                return db.rollback(function () {
                  throw err
                })
              }

              const recordinputs = {
                operation: "Modify老用户修改密码",
                resource_id: user_id,
                region: "江苏 南京",
                user: '新用户',
                access: "普通用户",
                user_id: user_id
              }
              return res.status(200).json(recordinputs)
            })
          })
        })
      })
    })
  })
}

//登录
export const login = (req, res) => {
  const q = "SELECT * FROM user WHERE username=?"
  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.json(req)
    if (data.length === 0) return res.status(404).json("用户不存在")

    //检查密码
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    )
    if (!isPasswordCorrect) return res.status(400).json("错误的用户名或密码")

    const token = jwt.sign({ id: data[0].id }, "jwtkey")
    const { password, ...other } = data[0]

    res.cookie("access_token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 七天后过期
      sameSite: 'none',
      secure: true
    }).status(200).json(other)

  })

}

//登出
export const logout = (req, res) => {
  res.clearCookie("access_token", {
    sameSite: 'none',
    secure: true
  }).status(200).json("用户登出")
}

//移除licalStorage
export const localStorage_remove = (req, res) => {
  const cookies = req.headers.cookie
  if (cookies && cookies.includes('access_token')) {
    return res.status(200).json(1)
  } else {
    return res.status(200).json(0)
  }
}
import express from "express"
import { register, login, logout, localStorage_remove, email, modify_password } from "../controllers/auth.js"

const router = express.Router()

router.post('/register', register)//注册
router.post('/login', login)//登录
router.post('/logout', logout)//登出
router.post('/modify', modify_password)//修改密码
router.get('/email_send/:emailAddress', email)//发邮件
router.get('/localStorage_remove', localStorage_remove)//cookie不存在则清除localStorage

export default router
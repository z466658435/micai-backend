import express from "express"
import { register, login, logout, localStorage_remove, email, modify } from "../controllers/auth.js"

const router = express.Router()

router.get('/email_send/:emailAddress', email)
router.post('/register', register)
router.post('/modify', modify)
router.post('/login', login)
router.post('/logout', logout)
router.get('/localStorage_remove', localStorage_remove)

export default router
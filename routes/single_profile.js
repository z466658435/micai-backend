import express from "express"
import { getsingle,getavatar,getphoto } from "../controllers/single_profile.js"

const router=express.Router()

router.get('/:uuid',getsingle)//拿到个人资料
router.get('/avatar/:imageName',getavatar)//拿到个人头像blob
router.get('/photo/:imageName',getphoto)//拿到个人照片blob


export default router
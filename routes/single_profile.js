import express from "express"
import { getsingle,getavatar,getphoto } from "../controllers/single_profile.js"

const router=express.Router()

router.get('/:uuid',getsingle)//拿到个人资料
router.get('/avatar/:imageName',getavatar)//拿到个人头像blob
router.get('/photo/:imageName',getphoto)//拿到个人照片blob 和picture/photo不同 因为个人页面是拿取别人的照片 而不是自己的 也就是说不能用currentUser.id 得从数据库中拿取id picture/photo是后台系统拿取照片 有现成的userId可以使用 所以需要两个URL

export default router
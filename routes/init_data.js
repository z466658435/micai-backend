import express from "express"
import { get_firstpage_data, get_memberpage_data, get_articlepage_data} from "../controllers/init_data.js"

const router = express.Router()

router.get('/home', get_firstpage_data)//拿取首页初始数据
router.get('/pic/:data/:type', get_memberpage_data)//拿取成员页初始数据
router.get('/art/:data/:type', get_articlepage_data)//拿取文章页初始数据

export default router
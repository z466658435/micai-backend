import http from "http"
import WebSocket from 'ws'

// 创建 WebSocket 服务器
const createWebSocketServer = () => {
  const server = http.createServer()
  const wss = new WebSocket.Server({ server })
  // 记录当前连接的客户端数量
  let clientCount = 0

  // 函数用于初始化和重连 WebSocket 服务器
  const initiateWebSocket = () => {
    //服务器连接
    wss.on('connection', (socket) => {
      clientCount++ // 每次有新连接时，增加客户端数量
      console.log(`新用户连接，连接总量：${clientCount}`)
      wss.clients.forEach((client) => { // 发送当前客户端数量到所有连接的客户端
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'count', count: clientCount }))
        }
      })

      // 监听消息事件
      socket.on('message', (message) => {
        console.log(`接收消息: ${message}`)
      })

      // 监听连接错误事件 需要重新连接服务器
      socket.on('error', (error) => {
        console.log("socket连接出现错误,准备断开连接 报错为:" + error)
        socket.close()
      })

      // 监听断开连接事件
      socket.on('close', () => {
        clientCount--
        // 每次连接断开时，减少客户端数量
        console.log(`用户断开连接，连接总量: ${clientCount}`)
        // setTimeout(() => {
        //   console.log('socket尝试重新连接WebSocket...')
        //   initiateWebSocket()
        // }, 1000)
        // 发送更新后的客户端数量到所有连接的客户端
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'count', count: clientCount }))
          }
        })
      })
    })

    // 服务器监听连接错误事件
    wss.on('error', (error) => {
      console.log(666)
      console.log(error)
      console.error('WebSocket服务器错误:', error)
      wss.close()
      // 处理重连逻辑
      setTimeout(() => {
        console.log('尝试重新连接WebSocket服务器...')
        createWebSocketServer()
      }, 3000)
    })

    // 服务器监听连接关闭事件
    wss.on('close', () => {
      console.log('websocket服务器连接关闭')
    })
  }

  initiateWebSocket()

  // 启动服务器
  server.listen(8183, () => {
    console.log('WebSocket服务器已启动!')
    console.log('WebSocket 正在端口 8183 中运行')
  })

  return wss
}

export default createWebSocketServer

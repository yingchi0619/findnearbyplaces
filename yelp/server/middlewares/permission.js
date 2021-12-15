import redis from '../utils/redis'
import { AES256GCMDecode, getClientIP } from '../utils/utils'
import { auth } from '../utils/response'
import { tokenExpire } from '../utils/config'
import { userToken, userOldToken } from '../utils/redis-key'

// 不需要check token的接口
const apiList = ['/']

const checkApiList = (url) => {
  let bool = false
  apiList.some((item, index) => {
    if (url.includes(item)) {
      bool = true
      return true
    }
  })
  return bool
}

const checkToken = async (ctx) => {
  const token = ctx.request.headers['x-token']
  const user_id = ctx.request.headers['x-user-id']
  if (!token || !user_id) {
    ctx.body = auth()
    return false
  }

  // 校验token白名单
  const whiteList = await Promise.all([
    redis.get(userToken(user_id)),
    redis.get(userOldToken(user_id))
  ])
  if (!whiteList.includes(token)) {
    ctx.body = auth('token已经失效，请重新登录')
    return false
  }

  const user = AES256GCMDecode(token)
  if (user.user_id != user_id) {
    ctx.body = auth()
    return false
  }

  if (+new Date() - user.time >= tokenExpire * 1000) {
    ctx.body = auth('token已经失效，请重新登录')
    return false
  }
  
  ctx.request.body.user_id = user_id
  ctx.request.body.token = token
  ctx.request.body.ip = getClientIP(ctx.req)
  return true
}

export default async function (ctx, next) {
  const filter = checkApiList(ctx.req.url)
  const validity = await checkToken(ctx)
  if (filter || validity) {
    await next()
  }
}

import schedule from 'node-schedule'

export default function () {
	if (process.env.NODE_APP_INSTANCE == '0') {
		// 每天23:59:00执行
		// schedule.scheduleJob('00 59 23 * * *', async () => {
    //   console.log(`${new Date().toLocaleString()}: 零点计划已执行`)
    // })
	} else if (process.env.NODE_APP_INSTANCE == '1') {
    // 每小时0分0秒执行
		// schedule.scheduleJob('0 0 * * * *', async () => {
    //   console.log(`${new Date().toLocaleString()}: 小时计划已执行`)
    // })
    // schedule.scheduleJob('0 * * * * *', async () => {
    //   console.log(`${new Date().toLocaleString()}: 分钟计划已执行`)
		// })
  }
}

import Config from '../config'
import totalAssets from './everyDays/totalAssets'
import marketTime from './everyDays/marketTime'
// import amqp from 'amqplib'
let sequelize = Config.CreateSequelize()
let redisClient = Config.CreateRedisClient();
// async function startMQ() {
//     let amqpConnection = await amqp.connect(Config.amqpConn)
//     let channel = await amqpConnection.createChannel()
//     let ok = await channel.assertQueue('common')
//     channel.consume('common', msg => {
//         let data = JSON.parse(msg.content.toString())

//         channel.ack(msg)
//     })
// }
// startMQ()

//每天执行函数
let everyDayFuns = [
    totalAssets, marketTime
]
async function initEveryDayFuns() {
    for (let f of everyDayFuns) {
        let flag = await redisClient.getAsync('timeRunFlag:' + f.name)
        if (flag) {
            f.lastRun = new Date(flag)
        }
    }
}
initEveryDayFuns()
setInterval(() => {
    let now = new Date()
    for (let f of everyDayFuns) {
        if (f.checkAndRun(now, { sequelize, redisClient })) {
            redisClient.set('timeRunFlag:' + f.name, now)
        }
    }
    if (marketTime.setRedis) marketTime.setRedis(now)
    else {
        marketTime.callback({ sequelize, redisClient }).then(() => {
            marketTime.setRedis(now)
        })
    }
}, 1000)
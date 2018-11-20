const _ = require('lodash')

module.exports = async (fastify, opts) => {
  fastify.get('/', async function (req, res) {
    const cursor = this.mongo.db.collection('messages') //connect to collection

    const limit = _.toInteger(req.query.limit) || 10 // google fastify request. Here we are taking query params and if there are no query - we use default
    const page = _.toInteger(req.query.page) || 1

    const count = await cursor.count(); //get messages count

    const result = await cursor.find({}).skip((limit * (page - 1)) - (page-1)).limit(limit).toArray();// we take all items, limit them, skip a limited and return array
    const info = { current_page: page, all_pages: _.ceil(count / limit), all_results: count }; // data for pagination


    res.send({ messages: result, info }) // send result
  })
}

module.exports.prefixOverride = '/api/messages'
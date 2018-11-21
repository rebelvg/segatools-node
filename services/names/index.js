const _ = require('lodash')

module.exports = async (fastify, opts) => {
	fastify.get('/', async function (req, res) {
		const cursor = this.mongo.db.collection('names') //connect to collection
		const limit = _.toInteger(req.query.filter)
		var foundnames = await cursor.find( { $or: [ {"English": new RegExp(req.query.filter, "i")} , {"Japanese": new RegExp(req.query.filter, "i")} ]})
		const result = await foundnames.sort({timestamp: -1}).toArray();// we take all items, limit them, skip a limited and return array
		res.send({ names: result }) // send result
	})
}

module.exports.prefixOverride = '/api/names'
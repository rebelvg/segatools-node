const _ = require('lodash')

module.exports = async (fastify, opts) => {
	fastify.get('/', async function (req, res) {
		const cursor = this.mongo.db.collection('messages') //connect to collection
		const limit = _.toInteger(req.query.limit) || 10 // google fastify request. Here we are taking query params and if there are no query - we use default
		const page = _.toInteger(req.query.page) || 1

		var sortingstring = 'timestamp'
		var sortorder = -1

		if (req.query.sort_by) {sortingstring=req.query.sort_by}
		if (req.query.sort_order == "asc") {sortorder = 1}

		var query = {}
		if (req.query.search) 
		{
			const searchregex = new RegExp(_.escapeRegExp(req.query.search).replace(/^/i,"(?=.*").replace(/\s/g,")(?=.*").replace(/$/i,")"), "i");
			query["$or"] =[{'English': searchregex},{'Japanese': searchregex}];
		}
		if (req.query.chapter == "No Chapter") query["$or"] = [{'chapter': req.query.chapter},{'chapter': { $exists: false }}]
		else if (req.query.chapter) query["$and"] = [{'chapter': req.query.chapter},{'chapter': { $exists: true }}]
		if (req.query.filename) query["Filename"] = new RegExp(_.escapeRegExp(req.query.filename).replace(/\s/g,""), "i")
		if (req.query.speakers_count) query["nameIDs"] = {$size: _.toInteger(req.query.speakers_count)}
		//if (req.query.hide_changed) 
		//if (req.query.hide_completed) query["$where"] = "function() { return this.English.length != this.Japanese.length}" 

		const foundmessages = await cursor.find(query)		
		const count = await foundmessages.count();
		const result = await foundmessages.sort({[sortingstring]: sortorder}).skip((limit * (page - 1)) - (page-1)).limit(limit).toArray();// we take all items, sort them, limit them, skip a limited and return array
		const info = { current_page: page, all_pages: _.ceil(count / limit), all_results: count }; // data for pagination
		res.send({ info, messages: result }) // send result
	})
  

	fastify.get('/:id', async function (req, res) {
		const cursor = this.mongo.db.collection('messages') //connect to collection
		var ObjectID = require('mongodb').ObjectID;   
		const result = await cursor.findOne({_id: new ObjectID(req.params.id)});// we take all items, limit them, skip a limited and return array
		res.send({ messages: result }) // send result
	})
}

module.exports.prefixOverride = '/api/messages'
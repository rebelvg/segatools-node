const _ = require('lodash')

module.exports = async (fastify, opts) => {
	fastify.get('/', async function (req, res) {
		const cursor = this.mongo.db.collection('messages') //connect to collection
		const limit = _.toInteger(req.query.limit) || 10 // google fastify request. Here we are taking query params and if there are no query - we use default
		const page = _.toInteger(req.query.page) || 1
				
		const searchregex = new RegExp(_.escapeRegExp(req.query.search).replace(/^/i,"(?=.*").replace(/\s/g,")(?=.*").replace(/$/i,")"), "i")
		const filenameregex = new RegExp(_.escapeRegExp(req.query.filename).replace(/\s/g,""), "i")
		const chapterregex = new RegExp(_.escapeRegExp(req.query.chapter), "i")
		var sortingstring = 'timestamp'
		var sortorder = -1
		var speakercount = null
		if (req.query.sort_by) {sortingstring=req.query.sort_by}
		if (req.query.sort_order == "asc") {sortorder = 1}
		if (req.query.speakers_count) speakercount = _.toInteger(req.query.speakers_count)
		
		const foundmessages = await cursor.find({$and: [
		{$or:[	{"English": searchregex},	{"Japanese": searchregex}	]},
		{"Filename": filenameregex},
		//{"nameIDs": {$size: {$ifNull:[req.query.speakers_count, []] }} }
		//{"chapter": chapterregex} commented until database will be cleaned up
		]})
		
		const count = await foundmessages.count();
		const result = await foundmessages.sort({[sortingstring]: sortorder}).skip((limit * (page - 1)) - (page-1)).limit(limit).toArray();// we take all items, sort them, limit them, skip a limited and return array
		const info = { current_page: page, all_pages: _.ceil(count / limit), all_results: count }; // data for pagination
		res.send({ info, regex: speakercount, messages: result }) // send result
	})
  

	fastify.get('/:id', async function (req, res) {
		const cursor = this.mongo.db.collection('messages') //connect to collection
		var ObjectID = require('mongodb').ObjectID;   
		const result = await cursor.findOne({_id: new ObjectID(req.params.id)});// we take all items, limit them, skip a limited and return array
		res.send({ messages: result }) // send result
	})
}

module.exports.prefixOverride = '/api/messages'
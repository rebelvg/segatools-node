const _ = require('lodash')

module.exports = async (fastify, opts) => {
	fastify.get('/', async function (req, res) {
		const cursor = this.mongo.db.collection('messages') //connect to collection
		const limit = _.toInteger(req.query.limit) || 10 // google fastify request. Here we are taking query params and if there are no query - we use default
		const page = _.toInteger(req.query.page) || 1

		var sortingstring = 'timestamp' // default sorting by timestamp
		var sortorder = -1 //descending order by default

		if (req.query.sort_by) sortingstring=req.query.sort_by //if set - sort by this
		if (req.query.asc_order == "true") sortorder = 1 //ascension order if needed

		var query = {"$and":[]} //couldn't find a way to push in query easier

        if (req.query.search)
        {	//search both japanese and english, creating regexp that searches for every word separately
            const searchregex = new RegExp(_.escapeRegExp(req.query.search).replace(/^/i,"(?=.*").replace(/\s/g,")(?=.*").replace(/$/i,")"), "i");
            query["$and"].push({$or:[{'English': searchregex},{'Japanese': searchregex}] });
        }
		if (req.query.chapter == "No Chapter") query["$and"].push({$or:[{'chapter': req.query.chapter},{'chapter': { $exists: false }}]}) //if no chapter - search "no chapter" and items without chapter
		else if (req.query.chapter) query["$and"].push( {'chapter': req.query.chapter} ,{'chapter': { $exists: true }})	//if any other chapter - search for it and don't count items without chapter
		if (req.query.filename) query["$and"].push({"Filename": new RegExp(_.escapeRegExp(req.query.filename).replace(/\s/g,""), "i")}) //filename search, removes spaces
		if (req.query.speakers_count) query["$and"].push({"nameIDs": {$size: _.toInteger(req.query.speakers_count)}}) //search by speaker count
		if (req.query.speakers) query["$and"].push({"nameIDs": { "$all": req.query.speakers.split(',').map(Number) } }) //search by names separated by commas
		if (query["$and"].length == 0) query = {} //if "#and" is empty remove it to prevent error
        if (req.query.hide_completed) query["$where"] = "function() { return this.English.filter(e => e !== null).length != this.Japanese.filter(e => e !== '').length}"
        if (req.query.hide_changed) query["$where"] = "function() { return this.English.filter(e => e !== null).length == 0}"

		const foundmessages = await cursor.find(query)
		const count = await foundmessages.count();

		const names = await this.mongo.db.collection('names').find().toArray();	//get all names to put into the output
		var result = await foundmessages.skip((limit * (page - 1)) - (page-1)).limit(limit).toArray();// we take all items, sort them, limit them, skip a limited and return array

        result.forEach(function(element)
		{	//add an array of names to output "Japanese (English)"
        	element.names = element.nameIDs.map((function(name)
			{
            	Englishname = ""
            	if (names[name].English) Englishname = " (" + names[name].English + ")"
            	return names[name].Japanese + Englishname
        	}))
			//add progress percentage
			element.progress = (element.English.filter(e => e !== null).length * 100 / element.Japanese.filter(e => e !== '').length).toFixed(1);
		})

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
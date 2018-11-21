const _ = require('lodash')

module.exports = async (fastify, opts) => {
	fastify.get('/', async function (req, res) {
		const cursor = this.mongo.db.collection('names') //connect to collection
		const limit = _.toInteger(req.query.filter)
		
		//if (empty($filter)) {
        //$cursor = $GLOBALS['names_collection']->find();
		//} else {
        //$filter = new MongoRegex("/{$filter}/i");
        //$cursor = $GLOBALS['names_collection']->find(array('$or' => array(
        //      array("Japanese" => array('$in' => array($filter))),
        //    array("English" => array('$in' => array($filter))))
        //)
		
		//db.users.find(name: /^search/);
		
		const count = await cursor.count(); //get messages count
		const result = await cursor.find({}).skip((limit * (page - 1)) - (page-1)).limit(limit).toArray();// we take all items, limit them, skip a limited and return array
		const info = { current_page: page, all_pages: _.ceil(count / limit), all_results: count }; // data for pagination
		res.send({ messages: result, info }) // send result
	})
}

module.exports.prefixOverride = '/api/names'
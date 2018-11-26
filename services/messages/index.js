const _ = require('lodash')

module.exports = async(fastify, opts) => {
    fastify.get('/', async function(req, res) {
        const cursor = this.mongo.db.collection('messages') //connect to collection
        const limit = _.toInteger(req.query.limit) || 10 // google fastify request. Here we are taking query params and if there are no query - we use default
        const page = _.toInteger(req.query.page) || 1
        const names = await this.mongo.db.collection('names').find().toArray(); //get all names to put into the output
        var sortingstring = 'timestamp' // default sorting by timestamp
        var sortorder = -1 //descending order by default

        if (req.query.sort_by) sortingstring = req.query.sort_by //if set - sort by this
        if (req.query.asc_order) sortorder = 1 //ascension order if needed

        var query = { "$and": [] } //couldn't find a way to push in query easier

        if (req.query.search) { //search both japanese and english, creating regexp that searches for every word separately
            const searchregex = new RegExp(_.escapeRegExp(req.query.search).replace(/^/i, "(?=.*").replace(/\s/g, ")(?=.*").replace(/$/i, ")"), "i");
            query["$and"].push({ $or: [{ 'English': searchregex }, { 'Japanese': searchregex }] });
        }
        if (req.query.chapter === "No Chapter") query["$and"].push({ $or: [{ 'chapter': req.query.chapter }, { 'chapter': { $exists: false } }] }) //if no chapter - search "no chapter" and items without chapter
        else if (req.query.chapter) query["$and"].push({ 'chapter': req.query.chapter }, { 'chapter': { $exists: true } }) //if any other chapter - search for it and don't count items without chapter
        if (req.query.filename) query["$and"].push({ "Filename": new RegExp(_.escapeRegExp(req.query.filename).replace(/\s/g, ""), "i") }) //filename search, removes spaces
        if (req.query.speakers_count) query["$and"].push({ "nameIDs": { $size: _.toInteger(req.query.speakers_count) } }) //search by speaker count

        if (req.query.namesIDs) {
            console.log(typeof(req.query.namesIDs))
            if (typeof(req.query.namesIDs) == 'object') query["$and"].push({ "nameIDs": { "$all": req.query.namesIDs.map(Number) } })
            else if (typeof(req.query.namesIDs) === "string") query["$and"].push({ "nameIDs": _.toInteger(req.query.namesIDs) })
        } //search by name IDs

        if (req.query.names) {
            console.log(typeof(req.query.names))
            if (typeof(req.query.names) === "object") { //if more than one name
                let speakers = []
                speakers = req.query.names.map(function(element) {
                    let spkrarray = []
                    for (let i = 0; i < names.length; i++) { if (names[i].English === element.replace(/^\s/g, '').replace(/\s$/g, '')) spkrarray.push(i) }
                    return spkrarray
                })
                query["$and"].push({ "nameIDs": { "$all": _.flatten(speakers) } })
            } else if (typeof(req.query.names) === "string") { //if one name
                let speakers
                for (let i = 0; i < names.length; i++) { if (names[i].English === req.query.names.replace(/^\s/g, '').replace(/\s$/g, '')) speakers = i }
                query["$and"].push({ "nameIDs": speakers })
            }
        } //search by names 

        if (query["$and"].length === 0) query = {} //if "#and" is empty remove it to prevent error
        if (req.query.hidecompleted) query["$where"] = "function() { return this.English.filter(e => e !== null).length != this.Japanese.filter(e => e !== '').length}"
        if (req.query.hidechanged) query["$where"] = "function() { return this.English.filter(e => e !== null).length == 0}"

        const foundmessages = await cursor.find(query)
        const count = await foundmessages.count();
        var result = await foundmessages.sort({
            [sortingstring]: sortorder
        }).skip((limit * (page - 1)) - (page - 1)).limit(limit).toArray(); // we take all items, sort them, limit them, skip a limited and return array

        result.forEach(function(element) {
            //add an array of names to output "Japanese (English)"
            element.names = element.nameIDs.map((function(name) {
                    let Englishname = ""
                    if (names[name].English) Englishname = " (" + names[name].English + ")"
                    return names[name].Japanese + Englishname
                }))
                //add an array of speakers "Japanese (English)"
            element.SpeakerName = element.Speaker.map((function(name) {
                    let fullnames = ""
                    if (name != null) {
                        let Englishname = ""
                        if (names[name].English) Englishname = " (" + names[name].English + ")"
                        fullnames = names[name].Japanese + Englishname
                    }
                    return fullnames
                }))
                //add progress percentage
            element.progress = parseFloat((element.English.filter(e => e !== null).length * 100 / element.Japanese.filter(e => e !== '').length).toFixed(1));
        })

        const info = { current_page: page, all_pages: _.ceil(count / limit), all_results: count }; // data for pagination
        res.send({ info, quer: query, messages: result }) // send result
    })


    fastify.get('/:id', async function(req, res) {
        const cursor = this.mongo.db.collection('messages') //connect to collection
        var ObjectID = require('mongodb').ObjectID;
        const ID = new ObjectID(req.params.id)
        const allmessages = await cursor.find().sort({ "_id": 1 }).toArray()
        const idmessage = allmessages.findIndex(function(element) { return element._id == req.params.id; })
        if (idmessage !== -1) {
            let messagesCountArray = [];
            let idarray = [];
            var result = allmessages[idmessage]
                //loop through all messages and count how many times each one appear
            for (let i = 0; i < result.Japanese.length; i++) {
                var messageCount = 0;
                allmessages.forEach(function(file) {
                    file.Japanese.forEach(function(messinfile) {
                        if (messinfile === result.Japanese[i]) messageCount++
                    })
                    if ((file.chapter === result.chapter) && (i === 0)) { idarray.push(file._id) } //get ids of all files from a chapter with file once
                })
                messagesCountArray.push(i + " / " + messageCount)
            }
            result.count = messagesCountArray;
            //add previous and next id in chapter
            currentid = idarray.indexOf(result._id)
            if (currentid > 0) result.prev_id = idarray[currentid - 1]
            if (currentid < idarray.length - 1) result.next_id = idarray[currentid + 1]
                //add names list
            const names = await this.mongo.db.collection('names').find().toArray(); //get all names to put into the output
            result.names = result.nameIDs.map((function(name) {
                Englishname = ""
                if (names[name].English) Englishname = " (" + names[name].English + ")"
                return names[name].Japanese + Englishname
            }))
            result.SpeakerName = result.Speaker.map((function(name) {
                    let fullnames = ""
                    if (name != null) {
                        let Englishname = ""
                        if (names[name].English) Englishname = " (" + names[name].English + ")"
                        fullnames = names[name].Japanese + Englishname
                    }
                    return fullnames
                }))
                //add progress percentage
            result.progress = parseFloat((result.English.filter(e => e !== null).length * 100 / result.Japanese.filter(e => e !== '').length).toFixed(1));
        }
        res.send(result)
    })
}

module.exports.prefixOverride = '/api/messages'
    /* List of all functions:
	old:
	search
    filename
    chapter
    speakers_count
	names
	hidecompleted
	hidechanged
	
	new:
	sort_by
    asc_order
    namesIDs - same as names, but for ids

     */
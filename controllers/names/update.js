const { ObjectID } = require('mongodb');

const Name = require('../../models/name');

async function update(req, res, next) {
  const mongoClient = req.app.get('mongoClient');

  const { id: nameId } = req.params;

  const { english } = req.body;

  const nameCollection = mongoClient.collection('names');

  const nameRecord = await nameCollection.findOne({
    _id: new ObjectID(nameId)
  });

  if (!nameRecord) {
    throw new Error('Name not found.');
  }

  const nameModel = new Name(nameRecord);

  nameModel.update({
    english
  });

  await nameCollection.updateOne(
    { _id: nameRecord._id },
    {
      $set: {
        ...nameModel
      }
    }
  );

  const updateResult = {
    nameUpdated: nameRecord.nameId
  };

  res.send(updateResult);
}

module.exports = update;

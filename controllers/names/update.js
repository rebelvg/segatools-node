const { ObjectID } = require('mongodb');

const Name = require('../../models/name');

async function update(ctx, next) {
  const { request: req } = ctx;

  const mongoClient = ctx.mongoClient;

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

  ctx.body = updateResult;
}

module.exports = update;

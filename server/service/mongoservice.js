const EventEmitter = require('events');
const publisher = new EventEmitter();

const db = require('../service/mongo');

// 插入图片文档
const insertDocument = async (collectionName, document) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await db.connect();
      const collection = database.collection(collectionName);
      const result = await collection.insertOne(document);
      resolve(result.insertedId);
    } catch (err) {
      console.error('插入文档失败:', err);
      reject(err);
    }
  });
}
// 普通插入
const insertDocumentNormal = async (collectionName, document) => { 
  return new Promise(async (resolve, reject) => {
    try {
      const database = await db.connect();
      const collection = database.collection(collectionName);
      const result = await collection.insertOne(document);
      resolve(result.insertedId);
    } catch (err) {
      console.error('插入文档失败:', err);
      reject(err);
    }
  });
}

const updateDocument = async (collectionName, filter, update) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await db.connect();
      const collection = database.collection(collectionName);
      const result = await collection.updateOne(filter, update);
    } catch (err) {
      console.error('更新文档失败:', err);
      reject(err);
    }
  });
}

const deleteDocument = async (collectionName, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await db.connect();
      const collection = database.collection(collectionName);
      const result = await collection.deleteOne(filter);
      resolve(result.deletedCount);
    } catch (err) {
      console.error('删除文档失败:', err);
      reject(err);
    }
  });
}

const findDocuments = async (collectionName, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await db.connect();
      const collection = database.collection(collectionName);
      const documents = await collection.find(filter).toArray();
      resolve(documents);
    } catch (err) {
      console.error('查询文档失败:', err);
      reject(err);
    }
  });
}
// 分页查询文档
const findDocumentsReversePagination = async (collectionName, filter, pageSize, pageNumber) => {
  return new Promise(async (resolve, reject) => {
    try {
      const database = await db.connect();
      const collection = database.collection(collectionName);

      // 获取总文档数量
      const totalCount = await collection.countDocuments(filter);

      // 计算要跳过的文档数量
      const skipCount = (pageNumber - 1) * pageSize;

      // 执行倒序分页查询
      const documents = await collection
        .find(filter)
        .sort({ _id: -1 }) // 根据 _id 字段倒序排序
        .skip(skipCount)
        .limit(pageSize)
        .toArray();

      // 构造返回结果对象
      const result = {
        totalCount,
        pageSize,
        pageNumber,
        totalPages: Math.ceil(totalCount / pageSize),
        data: documents,
      };

      resolve(result);
    } catch (err) {
      console.error('查询文档失败:', err);
      reject(err);
    }
  });
};


module.exports = {
  insertDocumentNormal,
  insertDocument,
  updateDocument,
  deleteDocument,
  findDocuments,
  findDocumentsReversePagination,
  publisher
};

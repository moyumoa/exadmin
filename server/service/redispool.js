var config = require('../config/qredis');

const redisDb = {};
var redis = require('redis');
const genericPool = require('generic-pool');

const factory = {
    create: function () {
        return redis.createClient(config.port, config.host, {
            auth_pass: config.password
        });
    },
    destroy: function (client) {
        client.quit();
    }
};

const opts = {
    max: config.pool_max_num, // maximum size of the pool
    min: config.pool_min_num // minimum size of the pool
};
const myPool = genericPool.createPool(factory, opts);

redisDb.myPool = myPool;


/**
 * 添加string类型的数据
 * @param key 键
 * @params value 值
 * @params expire (过期时间,单位秒;可为空，为空表示不过期)
 * @param callBack(err,result)
 */

redisDb.set = (dbNum, key, value, expire) => {
    return new Promose((resolve, reject) => {
        myPool.acquire().then((client) => {
            client.select(dbNum, (err, res) => {
                client.set(key, value, (err, result) => {
                    if (err) {
                        myPool.release(client);
                        reject(err);
                        return
                    }
                    if (!isNaN(expire) && expire > 0) {
                        client.expire(key, parseInt(expire));
                    }
                    myPool.release(client);
                    resolve(result);

                })
            })
        })
    })
    
}

/**
 * 查询string类型的数据
 * @param key 键
 * @param callBack(err,result)
 */
redisDb.get = (dbNum, key, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.get(key, (err, result) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                        return;
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};

/**
 * 删除string类型的数据
 * @param key 键
 * @param callBack(err,result)
 */
redisDb.del = (dbNum, key, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.del(key, (err, result) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                        return;
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 在散列里面关联起给定的键值对
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.hset = function (dbNum, key, subKey, body, callback) {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, function (err, res) {
                client.hset(key, subKey, body, function (err, result) {
                    if (err) {
                        myPool.release(client);
                        // logger.error(err);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 在散列里面关联起给定的键值对
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.hget = (dbNum, key, subKey, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.hget(key, subKey, (err, result) => {
                    if (err) {
                        myPool.release(client);
                        // logger.error(err);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 在散列里面关联起给定的键值对hash[]
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.hmget = (dbNum, key, subKeys, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.hmget(key, subKeys, (err, result) => {
                    if (err) {
                        // logger.error(err);
                        myPool.release(client);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};

/**
 * 在散列里面关联起给定的键值对hash[]
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.hmset = function (dbNum, key, subKeys, body, callback) {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, function (err, res) {
                client.hmset(key, subKeys, body, function (err, result) {
                    if (err) {
                        myPool.release(client);
                        // logger.error(err);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 查询Hashes类型的所有数据 所有属性
 * @param key 键
 * @param callBack(err,result)
 */
redisDb.hgetall = function (dbNum, key, callback) {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, function (err, res) {
                client.hgetall(key, function (err, result) {
                    if (err) {
                        // logger.error('redisservice-line96:' + err);
                        myPool.release(client);
                        callback(err, null);
                        return;
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 检查给定键是否在散列中
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.hexists = function (dbNum, key, subKey, callback) {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, function (err, res) {
                client.hexists(key, subKey, function (err, result) {
                    if (err) {
                        myPool.release(client);
                        // logger.error(err);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 获取一个有序集合中的成员数量
 */
redisDb.zcard = (dbNum, key, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.zcard(key, (err, response) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 根据元素在有序排列中的位置，从中取出元素，按照score从低到高顺序返回
 * @param key
 * @param page
 * @param count
 * @param callback
 */
redisDb.zrange = (dbNum, key, page, count, callback) => {
    var args2 = [key, (page - 1) * count, page * count - 1];
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.zrange(args2, (err, response) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 返回有序集合所有成员
 * @param  {} dbNum
 * @param  {} key
 * @param  {} callback
 */
redisDb.zrangeAll = (dbNum, key, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                //选择数据库
                var args2 = [key, 0, -1];
                client.zrange(args2, (err, response) => {
                    if (err) {
                        // logger.error('redisservice-line238:' + err);
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 返回有序集合所有成员和分数
 * @param  {} dbNum
 * @param  {} key
 * @param  {} callback
 */
redisDb.zrangeAllWithscore = (dbNum, key, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                //选择数据库
                var args2 = [key, 0, -1, 'WITHSCORES'];
                client.zrange(args2, (err, response) => {
                    if (err) {
                        logger.error('redisservice-line238:' + err);
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};

/**
 * 根据元素在有序排列中的位置，从中取出元素,通过下标获取 按照score从高到低顺序返回
 * @param key
 * @param start
 * @param end
 * @param callback
 */
redisDb.zrevrange = (dbNum, key, page, count, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            var args2 = [key, (page - 1) * count, page * count - 1];
            client.select(dbNum, (err, res) => {
                client.zrevrange(args2, (err, response) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 获得元素的分数
 * @param key
 * @param page
 * @param count
 * @param callback
 */
redisDb.zscore = (dbNum, key, data, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                if (!key || !data) {
                    myPool.release(client);
                    callback(null, null);
                } else {
                    client.zscore(key, data, (error, score) => {
                        if (error) {
                            myPool.release(client);
                            callback(null, null);
                        } else {
                            myPool.release(client);
                            callback(null, score);
                        }
                    });
                }
            });
        })
        .catch(function (err) {
        });
};
/**
 * 获取value的排位
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.zrank = (dbNum, key, value, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.zrank(key, value, (err, result) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};

/**
 * 获取value的排位(从大到小)
 * @param key 键
 * @params body 值
 * @param callBack(err,result)
 */
redisDb.zrevrank = (dbNum, key, value, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.zrevrank(key, value, (err, result) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    }
                    myPool.release(client);
                    callback(null, result);
                });
            });
        })
        .catch(function (err) {
        });
};

redisDb.zrangebyindex = (dbNum, key, start, page, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                //选择数据库
                var args2 = [key, Number(start + 1), Number(start) + Number(page)];
                client.zrange(args2, (err, response) => {
                    if (err) {
                        // logger.error('redisservice-line203:' + err);
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 获取value的排位
 * @param key 键
 * @params start 开始index
 * @param callBack(err,result)
 */
redisDb.zrevrangebyindex = (dbNum, key, start, page, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                //选择数据库
                var args2 = [key, Number(start + 1), Number(start) + Number(page)];
                client.zrevrange(args2, (err, response) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 获取指定分数区间的数据
 * @param key
 * @param from
 * @param to
 * @param callback
 */
redisDb.zrangebyscore = (dbNum, key, from, to, callback) => {
    var args2 = [key, from, to];
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, res) => {
                client.zrangebyscore(args2, (err, response) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, response);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 有序集合
 */
redisDb.zadd = (dbNum, key, data, expireTime, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, result) => {
                //选择数据库
                var t = new Date().getTime(); //时间戳作score
                client.zadd(key, -t++, new Date() + '-' + Number(data) / 1000, (err, response) => {
                    //过期时间,单位秒;可为空，为空表示不过期
                    if (expireTime) {
                        client.expire(key, expireTime);
                    }
                    myPool.release(client);
                    callback(null, response);
                });
            });
        })
        .catch(function (err) {
        });
};

redisDb.zaddscore = (dbNum, key, data, expireTime, score, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, result) => {
                //选择数据库
                client.zadd(key, score, data, (err, response) => {
                    //过期时间,单位秒;可为空，为空表示不过期s
                    if (expireTime) {
                        client.expire(key, expireTime);
                    }
                    myPool.release(client);
                    callback(null, response);
                });
            });
        })
        .catch(function (err) {
        });
};
/**
 * 求有序集合的并集-
 */
redisDb.zunionstore = (dbNum, key, keys, page, count, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, result) => {
                //选择数据库
                client.zunionstore([key, keys.length].concat(keys), (err, res) => {
                    myPool.release(client);
                    callback(null, res);
                });
            });
        })
        .catch(function (err) {
        });
};

/* *
 * list的存取
 * */
redisDb.lpush = (dbNum, key, searchInfo, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, result) => {
                client.lpush(key, searchInfo, (err, res) => {
                    myPool.release(client);
                    callback(null, res);
                });
            });
        })
        .catch(function (err) {
        });
};
redisDb.lrange = (dbNum, key, startNum, finalNum, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, result) => {
                client.lrange(key, startNum, finalNum, (err, res) => {
                    myPool.release(client);
                    callback(null, res);
                });
            });
        })
        .catch(function (err) {
        });
};
/* *
 *去重
 * */
redisDb.lrem = (dbNum, key, num, value, callback) => {
    myPool
        .acquire()
        .then(function (client) {
            client.select(dbNum, (err, result) => {
                client.lrem(key, num, value, (err, res) => {
                    if (err) {
                        myPool.release(client);
                        callback(err, null);
                    } else {
                        myPool.release(client);
                        callback(null, res);
                    }
                });
            });
        })
        .catch(function (err) {
        });
};
module.exports = redisDb;

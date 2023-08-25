
const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAliases({
	'@/db': path.resolve(__dirname.replace('config','service/models')),
	'@/service': path.resolve(__dirname.replace('config','service')),
});
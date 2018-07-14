'use strict';

const Path = require('path');
const write = require('write');
const del = require('del');
const apis = require('./data/apis-simple.json');
const modelToPath = require('./data/model-to-path.json');

const aliases = {
	query: 'list',
};

const byModel = apis.reduce((all, api) => {

	all[api.className] = all[api.className] || {
		className: api.className,
		modelName: api.modelName,
		pathName:  modelToPath[api.className] || '',
		apis:      []
	};

	all[api.className].apis.push(api);

	Object.keys(aliases).forEach(k => {

		if (api.method.indexOf(k) === -1) {
			return;
		}

		const alias = aliases[k];

		all[api.className].apis.push(Object.assign({}, api, { method: api.method.replace(k, alias) }));

	});

	return all;

}, {});

const modelList = Object.keys(byModel).reduce((all, className) => {

	return all.concat(byModel[className]);

}, []).sort((a, b) => a.className.localeCompare(b.className));

// Clear build/**
del.sync([
	Path.join(__dirname, 'build', '**')
]);

// Write result
write.sync(
	Path.join(__dirname, 'build', 'spec.json'),
	JSON.stringify(modelList, null, 4)
);

console.log('Done generating!');
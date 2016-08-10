const _ = require('lodash');
const gulp = require('gulp');
const jeditor = require('gulp-json-editor');
const rename = require('gulp-rename');

gulp.task('extract', () => {

	const versions = ['v1'];

	const listToMap = api => api.list.reduce((map, a) => {

		const [className, methodName] = a.module.split('.');

		if (!map[className]) map[className] = [];

		const aliases = api.aliases.reduce((all, replacer) => {

			const [from, to] = replacer;

			if (methodName.indexOf(from) >= 0) {

				all.push(methodName.replace(from, to));
			}

			return all;

		}, []);

		const params = (a.path.match(/\{[\w\-\*]+\}/g) || []).map(v => v.replace(/[\{\}]/g, ''));

		const useFormData = api.useFormData.indexOf(a.module) >= 0 ? true : undefined;

		map[className].push({
			name:    methodName,
			method:  a.method,
			path:    a.path,
			params,
			aliases,
			useFormData
		});

		return map;

	}, {});

	versions.forEach(version => {

		gulp.src(`./data/${ version }/api.json`)
			.pipe(jeditor(listToMap))
			.pipe(rename(path => path.basename = 'map'))
			.pipe(gulp.dest(`./data/${ version }`));

	});

});

gulp.task('default', ['extract']);
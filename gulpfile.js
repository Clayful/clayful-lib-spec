const _ = require('lodash');
const gulp = require('gulp');
const jeditor = require('gulp-json-editor');
const rename = require('gulp-rename');

gulp.task('extract', () => {

	const versions = ['v1'];

	const listToMap = api => api.list.reduce((map, a) => {

		const [className, methodName] = a.module.split('.');
		const options = [a.method, a.path];
		const aliases = api.aliases.reduce((all, replacer) => {

			const [from, to] = replacer;

			if (methodName.indexOf(from) >= 0) {

				all.push(methodName.replace(from, to));
			}

			return all;

		}, []);

		if (aliases.length > 0) options.push(aliases);

		return _.set(map, a.module, options);

	}, {});

	versions.forEach(version => {

		gulp.src(`./data/${ version }/api.json`)
			.pipe(jeditor(listToMap))
			.pipe(rename(path => path.basename = 'map'))
			.pipe(gulp.dest(`./data/${ version }`));

	});

});
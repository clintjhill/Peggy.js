module.exports = function(grunt){

	grunt.loadNpmTasks('grunt-jasmine-task');
	
	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.homepage %> <%= grunt.template.today("mm/dd/yyyy hh:mm TT") %> */'
		},
		lint: {
			all: ['src/**/*.js']
		},
		jshint: {
			options: {
				browser: true			
			}
		},
		concat: {
			core: {
				src: ["lib/underscore-1.3.3/underscore.js", "src/peggy.js", "src/scanner.js"],
				dest: "dist/<%=pkg.name%>-<%=pkg.version%>.js"
			}
		},
		min: {
			core: {
				src: ["<banner>", "dist/<%=pkg.name%>-<%=pkg.version%>.js"],
				dest: "dist/<%=pkg.name%>-<%=pkg.version%>.min.js"
			}
		},
		qunit: {
			core: "tests/index.html"
		}
	});

	grunt.registerTask("default", "lint concat min qunit");
	
};
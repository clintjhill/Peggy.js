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
			hitch: {
				src: ["src/peggy.js", "src/peggy.prototype.js", "src/engine.js", "src/executions.js", "src/scanner.js", "src/match.js"],
				dest: "dist/<%=pkg.name%>-<%=pkg.version%>.js"
			}
		},
		min: {
			hitch: {
				src: ["<banner>", "dist/<%=pkg.name%>-<%=pkg.version%>.js"],
				dest: "dist/<%=pkg.name%>-<%=pkg.version%>.min.js"
			}
		},
		jasmine: {
			index: ['specs/index.html'],
			grammars: ['specs/grammars.html']
		}
	});

	grunt.registerTask("default", "lint concat min jasmine");
	
};
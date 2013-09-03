module.exports = function(grunt){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/* <%= pkg.name %> - v<%= pkg.version %> - <%= pkg.homepage %> <%= grunt.template.today("mm/dd/yyyy hh:mm TT") %> */'
		},
		jshint: {
			all: ['src/**/*.js'],
			options: {
				browser: true			
			}
		},
		concat: {
			full: {
				src: ["lib/underscore-1.3.3/underscore.js", "src/peggy.js", "src/scanner.js"],
				dest: "dist/<%=pkg.name%>-full-<%=pkg.version%>.js"
			},
			no_underscore: {
				src: ["src/peggy.js", "src/scanner.js"],
				dest: "dist/<%=pkg.name%>-<%=pkg.version%>.js"
			}
		},
		uglify: {
			full: {
				src: ["<banner>", "dist/<%=pkg.name%>-<%=pkg.version%>.js"],
				dest: "dist/<%=pkg.name%>-full-<%=pkg.version%>.min.js"
			},
			no_underscore: {
				src: ["<banner>", "dist/<%=pkg.name%>-<%=pkg.version%>-only-peggy.js"],
				dest: "dist/<%=pkg.name%>-<%=pkg.version%>.min.js"
			}
		},
		qunit: {
			core: "tests/index.html"
		}
	});
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask("default", ["jshint", "concat", "uglify", "qunit"]);
	
};

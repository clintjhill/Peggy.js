SRC_DIR = src
TEST_DIR = specs
LIBS_DIR = libs
BUILD_DIR = build
DIST_DIR = ./dist
JS_ENGINE ?= `which node nodejs`
UNIT ?= `which jasmine-node`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe

BASE_FILES = ${LIBS_DIR}/strscan.js\
			${SRC_DIR}/peggy.js\
#			${SRC_DIR}/grammar.js

VER = ${shell cat version.txt}
PEGGY = ${DIST_DIR}/peggy-${VER}.js
PEGGY_CLEAN = ${DIST_DIR}/peggy-no-debug-${VER}.js
PEGGY_MIN = ${DIST_DIR}/peggy-min-${VER}.js

VERSION = sed "s/@VERSION/${VER}/"
REMOVE_DEBUGS = sed "/debugger;/d"

#all: spec lint min
all: lint min spec

${DIST_DIR}: 
	@@mkdir -p ${DIST_DIR}

core: ${DIST_DIR}
	@@echo "Building" ${PEGGY}
	@@cat ${BASE_FILES} | ${VERSION} > ${PEGGY};

lint: core
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Checking" ${PEGGY} "against JSHint ..."; \
		${JS_ENGINE} ${BUILD_DIR}/jslint-check.js ${PEGGY}; \
	else \
		echo "You must have Node.js installed to check Peggy.js against JSHint."; \
	fi

spec: 
	@@if test ! -z ${UNIT}; then \
		echo "Running specs ..."; \
		${UNIT} --color ${TEST_DIR}; \
	else \
		echo "You must have Node.js and jasmine-node installed to run tests."; \
	fi

min: 
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying" ${PEGGY}; \
		cat ${PEGGY} | ${REMOVE_DEBUGS} > ${PEGGY_CLEAN}; \
		${COMPILER} ${PEGGY_CLEAN} > ${PEGGY_MIN}; \
	else \
		echo "You must have Node.js installed to minify Peggy.js."; \
	fi

clean: 
	@@echo "Removing dist"
	@@rm -rf ${DIST_DIR}

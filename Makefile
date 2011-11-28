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
			${SRC_DIR}/engine.js\
			${SRC_DIR}/match.js\

PEGGY = ${DIST_DIR}/peggy.js
PEGGY_MIN = ${DIST_DIR}/peggy-min.js

VER = ${shell cat version.txt}
VERSION = sed "s/@VERSION/${VER}/"

all: spec lint core min

${DIST_DIR}: 
	@@mkdir -p ${DIST_DIR}

core: ${DIST_DIR}
	@@echo "Building" ${PEGGY}
	@@cat ${BASE_FILES} | ${VERSION} > ${PEGGY};

lint: core
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Checking" ${PEGGY} "against JSLint ..."; \
		${JS_ENGINE} ${BUILD_DIR}/jslint-check.js; \
	else \
		echo "You must have Node.js installed to check Peggy.js against JSLint."; \
	fi

spec: 
	@@if test ! -z ${UNIT}; then \
		echo "Running specs ..."; \
		${UNIT} --color --verbose ${TEST_DIR}; \
	else \
		echo "You must have Node.js and jasmine-node installed to run tests."; \
	fi

min: 
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying" ${PEGGY}; \
		${COMPILER} ${PEGGY} > ${PEGGY_MIN}; \
	else \
		echo "You must have Node.js installed to minify Peggy.js."; \
	fi

clean: 
	@@echo "Removing dist"
	@@rm -rf ${DIST_DIR}

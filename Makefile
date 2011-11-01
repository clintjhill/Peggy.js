SRC_DIR = src
TEST_DIR = test
LIBS_DIR = libs
BUILD_DIR = build
DIST_DIR = ./dist
JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe

BASE_FILES = ${LIBS_DIR}/strscan.js\
			${SRC_DIR}/peggy.js\
			${SRC_DIR}/engine.js\
			${SRC_DIR}/match.js\

PEGGY = ${DIST_DIR}/peggy.js
PEGGY_MIN = ${DIST_DIR}/peggy-min.js

VER = ${shell cat version.txt}
VERSION = sed "s/@VERSION/${VER}/"

all: core min

${DIST_DIR}: 
	@@mkdir -p ${DIST_DIR}

core: ${DIST_DIR}
	@@echo "Building" ${PEGGY}
	@@cat ${BASE_FILES} | ${VERSION} > ${PEGGY};

lint: core
	@@echo "Checking" ${PEGGY} "against JSLint ..."; \
	${JS_ENGINE} ${BUILD_DIR}/jslint-check.js;

min: 
	@@echo "Minifying" ${PEGGY}; \
	${COMPILER} ${PEGGY} > ${PEGGY_MIN}; \

clean: 
	@@echo "Removing dist"
	@@rm -rf ${DIST_DIR}

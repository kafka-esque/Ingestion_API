#!/bin/sh
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

# Maven Wrapper script for Unix/Linux
# This script will download Maven if needed and run it

set -e

# Determine Maven properties
PRG="$0"
while [ -h "$PRG" ] ; do
  ls=`ls -ld "$PRG"`
  link=`expr "$ls" : '.*-> \(.*\)$'`
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=`dirname "$PRG"`"/$link"
  fi
done

MAVEN_WRAPPER_DIR=`dirname "$PRG"`

if [ -d "$MAVEN_WRAPPER_DIR" ]; then
  MAVEN_WRAPPER_JAR="$MAVEN_WRAPPER_DIR/.mvn/wrapper/maven-wrapper.jar"
  if [ -r "$MAVEN_WRAPPER_JAR" ]; then
    # Run the Maven Wrapper
    exec java -cp "$MAVEN_WRAPPER_JAR" org.apache.maven.wrapper.MavenWrapperMain "$@"
  fi
fi

# If Maven Wrapper is not found, use the system Maven
exec mvn "$@"

echo ""
echo "Running Group ${1} Tests..."
mvn -f pom.xml -ntp "-Dgroups=${1}" "-Dorg.slf4j.simpleLogger.levelInBrackets=false" test
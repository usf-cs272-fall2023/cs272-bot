echo ""
echo "Running Group ${1} Tests..."
mvn -f pom.xml -ntp "-Dtest=${HOMEWORK_NAME}Test*${1}_*" test
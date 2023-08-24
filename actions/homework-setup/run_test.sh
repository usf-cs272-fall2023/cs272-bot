echo ""
echo "Running Group ${1} Tests..."
mvn -f pom.xml -ntp "-Dgroups=${1}" test
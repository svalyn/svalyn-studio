FROM eclipse-temurin:19-jre-alpine
RUN addgroup -S svalyn && adduser -S svalyn -G svalyn
USER svalyn:svalyn
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} svalyn-studio.jar
ENTRYPOINT ["java","-jar","/svalyn-studio.jar"]
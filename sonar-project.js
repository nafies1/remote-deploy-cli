import scanner from 'sonarqube-scanner';

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': 'remote-deploy-cli',
      'sonar.projectName': 'Remote Deploy CLI',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': 'bin,lib',
      'sonar.tests': 'test', // Assuming tests are in a 'test' directory
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.sourceEncoding': 'UTF-8',
    },
  },
  () => process.exit()
);

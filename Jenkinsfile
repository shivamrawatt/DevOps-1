
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Downloading source code from GitHub'
                checkout scm
            }
        }

        stage('Verify Files') {
            steps {
                echo 'Checking project files'
                sh 'ls -la'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image for Node.js application'
                sh 'docker build -t devops-1-app:latest .'
            }
        }

        stage('Deploy Application') {
            steps {
                echo 'Deploying Node.js application'

                withCredentials([file(
                    credentialsId: 'devops-1-env',
                    variable: 'ENV_FILE'
                )]) {
                    sh '''
                        docker rm -f DevOps-1-app || true

                        docker run -d \
                            --name DevOps-1-app \
                            --restart unless-stopped \
                            --network devops-1-network \
                            --env-file "$ENV_FILE" \
                            -p 5000:5000 \
                            devops-1-app:latest
                    '''
                }
            }
        }
    }
}

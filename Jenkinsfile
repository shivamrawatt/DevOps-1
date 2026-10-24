
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

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies'
                sh 'npm ci'
            }
        }

        stage('ESLint') {
            steps {
                echo 'Checking JavaScript code quality'
                sh 'npm run lint'
            }
        }

        stage('Jest Testing') {
            steps {
                echo 'Running Jest tests'
                sh 'npm test -- --runInBand'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image for Node.js application'

                sh '''
                    docker build \
                        -t devops-1-app:latest \
                        -t devops-1-app:v${BUILD_NUMBER} .
                '''
            }
        }

        stage('Approve Docker Hub Push') {
            steps {
                input(
                    message: "Do you want to push version v${BUILD_NUMBER} to Docker Hub?",
                    ok: 'Proceed',
                    submitter: ''
                )
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing versioned Docker image to Docker Hub'

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set -eu

                        echo "$DOCKERHUB_TOKEN" | docker login \
                            -u "$DOCKERHUB_USER" \
                            --password-stdin

                        docker tag devops-1-app:latest \
                            "$DOCKERHUB_USER/devops-1-app:latest"

                        docker tag devops-1-app:latest \
                            "$DOCKERHUB_USER/devops-1-app:v${BUILD_NUMBER}"

                        docker push \
                            "$DOCKERHUB_USER/devops-1-app:v${BUILD_NUMBER}"

                        docker push \
                            "$DOCKERHUB_USER/devops-1-app:latest"

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed. Check the failed stage in the Jenkins console output.'
        }

        always {
            echo 'CI pipeline execution finished.'
        }
    }
}

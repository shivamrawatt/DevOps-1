
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
                        echo "$DOCKERHUB_TOKEN" | docker login \
                            -u "$DOCKERHUB_USER" --password-stdin

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

        
stage('Approve Docker Deployment') {
    steps {
        input(
            message: "Do you want to deploy version v${BUILD_NUMBER} to the Docker container?",
            ok: 'Deploy',
            submitter: ''
        )
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

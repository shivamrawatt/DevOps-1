
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
    }
}
